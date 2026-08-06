/**
 * WebSocket client for real-time proctoring.
 * Handles bidirectional communication between student browser and FastAPI.
 */

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export class ProctoringWebSocket {
  constructor(examId, token, onViolationAck, onError) {
    this.examId = examId;
    this.token = token;
    this.onViolationAck = onViolationAck;
    this.onError = onError;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnects = 5;
  }

  connect() {
    const url = `${WS_BASE}/api/proctoring/ws/student/${this.examId}?token=${this.token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('[Proctor WS] Connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.onViolationAck?.(data);
    };

    this.ws.onerror = (err) => {
      console.error('[Proctor WS] Error:', err);
      this.onError?.(err);
    };

    this.ws.onclose = () => {
      console.warn('[Proctor WS] Disconnected. Attempting reconnect...');
      if (this.reconnectAttempts < this.maxReconnects) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
      }
    };
  }

  sendViolation(violationType, severity = 'medium', description = '') {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        violation_type: violationType,
        severity,
        description,
      }));
    }
  }

  disconnect() {
    this.ws?.close();
  }
}

/**
 * WebSocket client for teacher monitoring dashboard.
 * Receives real-time violation alerts from students.
 */
export class TeacherMonitorWebSocket {
  constructor(examId, token, onViolationReceived) {
    this.examId = examId;
    this.token = token;
    this.onViolationReceived = onViolationReceived;
    this.ws = null;
  }

  connect() {
    const url = `${WS_BASE}/api/proctoring/ws/teacher/${this.examId}?token=${this.token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => console.log('[Teacher Monitor WS] Connected');

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.onViolationReceived?.(data);
    };

    this.ws.onerror = (err) => console.error('[Teacher Monitor WS] Error:', err);
    this.ws.onclose = () => console.warn('[Teacher Monitor WS] Disconnected');
  }

  disconnect() {
    this.ws?.close();
  }
}
