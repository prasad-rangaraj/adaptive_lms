import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export function useProctoring() {
  const [status, setStatus] = useState('initializing'); // 'initializing', 'ready', 'tracking', 'error'
  const [isFaceVisible, setIsFaceVisible] = useState(true);
  const [isLookingAway, setIsLookingAway] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [lastViolation, setLastViolation] = useState(null);
  const [annotatedFrame, setAnnotatedFrame] = useState(null);

  const faceLandmarkerRef = useRef(null);
  const videoRef = useRef(null);
  const requestRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  // Thresholds
  const violationTimerRef = useRef(null);
  const isViolatingRef = useRef(false);

  // Phase 2: YOLOv8 Backend Vision Websocket
  const wsRef = useRef(null);
  const canvasRef = useRef(null);
  const visionIntervalRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function initModel() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1,
        });

        if (isMounted) {
          faceLandmarkerRef.current = faceLandmarker;
          setStatus('ready');
        }
      } catch (error) {
        console.error('Failed to initialize MediaPipe FaceLandmarker:', error);
        if (isMounted) setStatus('error');
      }
    }

    initModel();

    return () => {
      isMounted = false;
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  const triggerViolation = useCallback(() => {
    setWarnings(prev => prev + 1);
  }, []);

  // Monitor the refs and trigger state/warnings smoothly
  const evaluateBehavior = (faceVisible, lookingAway) => {
    setIsFaceVisible(faceVisible);
    setIsLookingAway(lookingAway);

    const isCurrentlyViolating = !faceVisible || lookingAway;

    if (isCurrentlyViolating && !isViolatingRef.current) {
      // Start timer
      isViolatingRef.current = true;
      violationTimerRef.current = setTimeout(() => {
        triggerViolation();
      }, 3000); // 3 seconds of looking away = 1 warning
    } else if (!isCurrentlyViolating && isViolatingRef.current) {
      // Clear timer if they look back
      isViolatingRef.current = false;
      if (violationTimerRef.current) {
        clearTimeout(violationTimerRef.current);
      }
    }
  };

  const processVideo = useCallback(() => {
    if (!videoRef.current || !faceLandmarkerRef.current) return;

    let startTimeMs = performance.now();
    if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      
      const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
      
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        // Face detected
        const landmarks = results.faceLandmarks[0];
        
        // Basic Head Pose estimation (Yaw)
        // 1 (Nose Tip), 234 (Left Cheek edge), 454 (Right Cheek edge)
        const nose = landmarks[1];
        const leftEdge = landmarks[234];
        const rightEdge = landmarks[454];

        if (nose && leftEdge && rightEdge) {
          const distLeft = Math.abs(nose.x - leftEdge.x);
          const distRight = Math.abs(nose.x - rightEdge.x);
          
          // If the ratio is heavily skewed, they are turning their head
          const ratio = distLeft / distRight;
          const isTurned = ratio > 2.5 || ratio < 0.4; // Tuned for standard webcams

          evaluateBehavior(true, isTurned);
        } else {
          evaluateBehavior(true, false); // Fail-safe
        }
      } else {
        // No face detected
        evaluateBehavior(false, false);
      }
    }

    requestRef.current = requestAnimationFrame(processVideo);
  }, [triggerViolation]);

  const startTracking = useCallback((videoEl, examId = 1) => {
    if (status === 'tracking') return;
    if (status !== 'ready') {
      console.warn('Proctoring engine not ready');
      return;
    }
    videoRef.current = videoEl;
    setStatus('tracking');
    requestRef.current = requestAnimationFrame(processVideo);

    // Initialize Canvas for backend vision sampling (Phase 2)
    if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;
    }

    // Connect to WebSocket
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        wsRef.current = new WebSocket(`ws://localhost:8000/api/proctoring/ws/vision/${examId}`);
        
        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.frame) {
                setAnnotatedFrame(`data:image/jpeg;base64,${data.frame}`);
            }
            if (data.status === 'violation') {
                console.warn('Backend Vision Violation:', data.type);
                setLastViolation(data.type);
                // Trigger frontend violation UI immediately
                triggerViolation();
            } else if (data.status === 'ok') {
                setLastViolation(null);
            }
        };

        // Start sampling interval (every 1.5 seconds for tighter monitoring)
        visionIntervalRef.current = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && videoRef.current) {
                // Skip frame if WebSocket is backed up (previous frame still sending)
                // This prevents memory buildup and wasted CPU on stale frames
                if (wsRef.current.bufferedAmount > 50000) return;

                const vw = videoRef.current.videoWidth;
                const vh = videoRef.current.videoHeight;
                if (vw && vh) {
                    // Preserve aspect ratio to prevent squishing (which breaks YOLO)
                    const targetWidth = 640;
                    const targetHeight = (vh / vw) * targetWidth;
                    
                    canvasRef.current.width = targetWidth;
                    canvasRef.current.height = targetHeight;
                    
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.drawImage(videoRef.current, 0, 0, targetWidth, targetHeight);
                    // Send high quality image
                    const base64Frame = canvasRef.current.toDataURL('image/jpeg', 0.85);
                    wsRef.current.send(base64Frame);
                }
            }
        }, 1500);
    }
  }, [status, processVideo, triggerViolation]);

  const stopTracking = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (violationTimerRef.current) {
      clearTimeout(violationTimerRef.current);
    }
    if (visionIntervalRef.current) {
        clearInterval(visionIntervalRef.current);
    }
    if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
    }
    setStatus('ready');
  }, []);

  return {
    status,
    isFaceVisible,
    isLookingAway,
    warnings,
    lastViolation,
    annotatedFrame,
    startTracking,
    stopTracking
  };
}
