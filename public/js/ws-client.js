/**
 * WebSec Auditor — WebSocket Client
 * Auto-reconnecting WebSocket for real-time scan updates.
 */
class WsClient {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 2000;
    this.connected = false;
  }

  /**
   * Connect to the WebSocket server.
   */
  connect() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${location.host}/ws`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        this.emit('connection', { connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('message', data);

          // Emit specific event types
          if (data.type) {
            this.emit(data.type, data);
          }
        } catch (e) {
          console.warn('[WS] Failed to parse message:', e);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.emit('connection', { connected: false });
        this.tryReconnect();
      };

      this.ws.onerror = () => {
        this.connected = false;
      };
    } catch (e) {
      console.error('[WS] Connection failed:', e);
      this.tryReconnect();
    }
  }

  /**
   * Attempt to reconnect after disconnect.
   */
  tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[WS] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 5);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Subscribe to an event.
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Unsubscribe from an event.
   */
  off(event, callback) {
    const cbs = this.listeners.get(event);
    if (cbs) {
      this.listeners.set(event, cbs.filter((cb) => cb !== callback));
    }
  }

  /**
   * Emit an event to all listeners.
   */
  emit(event, data) {
    const cbs = this.listeners.get(event) || [];
    for (const cb of cbs) {
      try { cb(data); } catch (e) { console.error(`[WS] Listener error:`, e); }
    }
  }

  /**
   * Send a scan subscription message to the server.
   */
  subscribe(scanId) {
    if (this.ws && this.connected) {
      this.ws.send(JSON.stringify({ type: 'subscribe', scanId }));
    }
  }

  /**
   * Clear scan subscription and listen globally.
   */
  unsubscribe() {
    if (this.ws && this.connected) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe' }));
    }
  }
}

window.wsClient = new WsClient();
