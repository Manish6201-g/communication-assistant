/**
 * WebSocket Service
 * Handles persistent binary & JSON communication with FastAPI backend.
 */
class TranslationWebSocketService {
  constructor() {
    this.ws = null;
    this.url = '';
    this.callbacks = {
      onOpen: () => {},
      onClose: () => {},
      onReady: () => {},
      onPartialTranscript: () => {},
      onTranslation: () => {},
      onTTSResponse: () => {},
      onStatus: () => {},
      onError: () => {}
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.isExplicitlyClosed = false;
  }

  connect(url = null) {
    if (url) {
      this.url = url;
    } else if (!this.url) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname || 'localhost';
      this.url = `${protocol}//${host}:8000/ws/stream`;
    }

    this.isExplicitlyClosed = false;

    try {
      this.ws = new WebSocket(this.url);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.callbacks.onOpen();
      };

      this.ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            this.handleJsonEvent(data);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        }
      };

      this.ws.onerror = (error) => {
        this.callbacks.onError(error);
      };

      this.ws.onclose = () => {
        this.callbacks.onClose();
        if (!this.isExplicitlyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
          this.reconnectTimeout = setTimeout(() => this.connect(), delay);
        }
      };
    } catch (err) {
      this.callbacks.onError(err);
    }
  }

  handleJsonEvent(data) {
    switch (data.type) {
      case 'ready':
        this.callbacks.onReady(data);
        break;
      case 'partial_transcript':
        this.callbacks.onPartialTranscript(data);
        break;
      case 'translation':
        this.callbacks.onTranslation(data);
        break;
      case 'tts_response':
        this.callbacks.onTTSResponse(data);
        break;
      case 'status':
        this.callbacks.onStatus(data);
        break;
      case 'error':
        this.callbacks.onError(data);
        break;
      default:
        console.warn('Unknown event received:', data);
    }
  }

  sendJson(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  sendAudioChunk(arrayBuffer) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(arrayBuffer);
    }
  }

  disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}

export const wsService = new TranslationWebSocketService();
