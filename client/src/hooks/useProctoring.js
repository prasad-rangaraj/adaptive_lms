import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export function useProctoring(options = {}) {
  const { onViolation } = options;
  const onViolationRef = useRef(onViolation);
  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

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
  const repeatViolationIntervalRef = useRef(null);
  const isViolatingRef = useRef(false);

  // Phase 2: YOLOv8 Backend Vision Websocket
  const wsRef = useRef(null);
  const canvasRef = useRef(null);
  const visionIntervalRef = useRef(null);

  const pendingTrackingRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function initModel(retries = 3) {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const filesetResolver = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
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
            if (pendingTrackingRef.current) {
              const { videoEl, examId } = pendingTrackingRef.current;
              startTracking(videoEl, examId);
            }
          }
          return; // Success, exit retry loop
        } catch (error) {
          console.error(`MediaPipe Init Attempt ${attempt} failed:`, error);
          if (attempt === retries && isMounted) {
            setStatus('error');
          } else {
            // Wait 1 second before retrying
            await new Promise(res => setTimeout(res, 1000));
          }
        }
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

  const triggerViolation = useCallback((violationType = 'eye_off_screen', description = 'Gaze deviation detected') => {
    setWarnings(prev => prev + 1);
    setLastViolation(violationType);

    // Capture snapshot if possible
    let snapshot = null;
    if (videoRef.current && videoRef.current.videoWidth) {
      try {
        const c = document.createElement('canvas');
        c.width = 320;
        c.height = 240;
        const ctx = c.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        snapshot = c.toDataURL('image/jpeg', 0.6);
      } catch (e) {}
    }

    if (onViolationRef.current) {
      onViolationRef.current(violationType, description, snapshot);
    }
  }, []);

  // Monitor the refs and trigger state/warnings smoothly
  const evaluateBehavior = (faceVisible, lookingAway) => {
    setIsFaceVisible(faceVisible);
    setIsLookingAway(lookingAway);

    const isCurrentlyViolating = !faceVisible || lookingAway;

    if (isCurrentlyViolating && !isViolatingRef.current) {
      // Start initial timer: 2.5 seconds of violation = 1 warning
      isViolatingRef.current = true;
      violationTimerRef.current = setTimeout(() => {
        const type = !faceVisible ? 'no_face' : 'eye_off_screen';
        const desc = !faceVisible ? 'Face not visible in camera frame' : 'Student looked away from screen';
        triggerViolation(type, desc);

        // If violation continues, increment warning every 4 seconds
        repeatViolationIntervalRef.current = setInterval(() => {
          if (isViolatingRef.current) {
            triggerViolation(type, desc);
          }
        }, 4000);
      }, 2500);
    } else if (!isCurrentlyViolating && isViolatingRef.current) {
      // Clear timers if user looks back into frame
      isViolatingRef.current = false;
      if (violationTimerRef.current) {
        clearTimeout(violationTimerRef.current);
      }
      if (repeatViolationIntervalRef.current) {
        clearInterval(repeatViolationIntervalRef.current);
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
      pendingTrackingRef.current = { videoEl, examId };
      return;
    }
    pendingTrackingRef.current = null;
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
            // Always show annotated frame from OpenCV/YOLO (both ok and violation)
            if (data.frame) {
                setAnnotatedFrame(`data:image/jpeg;base64,${data.frame}`);
            }
            if (data.status === 'violation') {
                console.warn('Backend Vision Violation:', data.type);
                const desc = data.type === 'phone_detected' ? 'Prohibited mobile phone detected' : 'Multiple people detected in view';
                setLastViolation(data.type);
                triggerViolation(data.type, desc);
            } else if (data.status === 'ok') {
                setLastViolation(null);
            }
        };

        // Start sampling interval (every 1.5 seconds for tighter monitoring)
        visionIntervalRef.current = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && videoRef.current) {
                if (wsRef.current.bufferedAmount > 50000) return;

                const vw = videoRef.current.videoWidth;
                const vh = videoRef.current.videoHeight;
                if (vw && vh) {
                    const targetWidth = 640;
                    const targetHeight = (vh / vw) * targetWidth;
                    
                    canvasRef.current.width = targetWidth;
                    canvasRef.current.height = targetHeight;
                    
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.drawImage(videoRef.current, 0, 0, targetWidth, targetHeight);
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
    if (repeatViolationIntervalRef.current) {
      clearInterval(repeatViolationIntervalRef.current);
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

  const resetWarnings = useCallback(() => {
    setWarnings(0);
    setLastViolation(null);
  }, []);

  return {
    status,
    isFaceVisible,
    isLookingAway,
    warnings,
    setWarnings,
    resetWarnings,
    lastViolation,
    annotatedFrame,
    startTracking,
    stopTracking
  };
}