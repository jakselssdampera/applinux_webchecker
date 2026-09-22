/**
 * WebSec Auditor — API Client
 * Fetch wrapper for communicating with the backend.
 */
const ApiClient = {
  /**
   * Make a GET request.
   */
  async get(path) {
    const res = await fetch(path);
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.message || error.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Make a POST request with JSON body.
   */
  async post(path, data) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.message || error.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  /** Check consent status */
  async checkConsent() {
    return this.get('/api/consent/status');
  },

  /** Submit consent */
  async submitConsent() {
    return this.post('/api/consent', { accepted: true });
  },

  /** Start a new scan */
  async startScan(url, modules) {
    return this.post('/api/scan', { url, modules });
  },

  /** Get scan details and results */
  async getScan(id) {
    return this.get(`/api/scan/${id}`);
  },

  /** List all scans */
  async listScans(limit = 50, offset = 0) {
    return this.get(`/api/scans?limit=${limit}&offset=${offset}`);
  },

  /** Get dashboard stats */
  async getStats() {
    return this.get('/api/stats');
  },

  /** Health check */
  async health() {
    return this.get('/api/health');
  },
};

window.ApiClient = ApiClient;
