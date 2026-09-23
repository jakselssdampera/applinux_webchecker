/**
 * WebSec Auditor — Scan Form Component
 */
const ScanForm = {
  render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="22" y1="12" x2="18" y2="12"></line>
            <line x1="6" y1="12" x2="2" y2="12"></line>
            <line x1="12" y1="6" x2="12" y2="2"></line>
            <line x1="12" y1="22" x2="12" y2="18"></line>
          </svg>
          New Scan
        </h1>
        <p>Enter a target URL to analyze its technology stack and security posture.</p>
      </div>

      <div class="glass-card scan-form-card animate-fade-in">
        <form id="scan-form">
          <div class="form-group mb-lg">
            <label class="form-label" for="scan-url">Target URL</label>
            <div class="scan-url-input-wrapper">
              <input
                type="text"
                id="scan-url"
                class="form-input"
                placeholder="https://example.com"
                autocomplete="url"
                spellcheck="false"
                required
              >
              <button type="submit" class="btn btn-primary" id="scan-submit-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="22" y1="12" x2="18" y2="12"></line>
                  <line x1="6" y1="12" x2="2" y2="12"></line>
                  <line x1="12" y1="6" x2="12" y2="2"></line>
                  <line x1="12" y1="22" x2="12" y2="18"></line>
                </svg>
                Start Scan
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Select Modules</label>
            <div class="module-select-grid">
              <label class="module-option">
                <input type="checkbox" value="profiler" checked>
                <div>
                  <div class="module-option-label">🔍 Tech Profiler</div>
                  <div class="module-option-desc">Identify technologies & WAF</div>
                </div>
              </label>
              <label class="module-option">
                <input type="checkbox" value="vuln-scanner" checked>
                <div>
                  <div class="module-option-label">🛡️ Vuln Scanner</div>
                  <div class="module-option-desc">Scan for common vulnerabilities</div>
                </div>
              </label>
              <label class="module-option">
                <input type="checkbox" value="exploit-sim">
                <div>
                  <div class="module-option-label">⚡ Exploit Sim</div>
                  <div class="module-option-desc">Safe PoC & vulnerability validation</div>
                </div>
              </label>
              <label class="module-option">
                <input type="checkbox" value="stress-tester">
                <div>
                  <div class="module-option-label">📊 Stress Test</div>
                  <div class="module-option-desc">Load test with HTTP flooding</div>
                </div>
              </label>
            </div>
          </div>
        </form>
      </div>

      <!-- Scan Progress -->
      <div id="scan-progress-area" class="mt-lg hidden">
        <div class="glass-card animate-fade-in">
          <div class="scan-progress">
            <div class="scan-progress-header">
              <div class="scan-progress-label">
                <div class="spinner"></div>
                <span id="scan-progress-status">Scanning...</span>
              </div>
              <span class="scan-progress-percent" id="scan-progress-percent">0%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" id="scan-progress-bar" style="width: 0%"></div>
            </div>
            <div class="scan-log" id="scan-log"></div>
          </div>
        </div>
      </div>

      <!-- Results Area -->
      <div id="scan-results-area" class="mt-lg hidden"></div>
    `;

    this.bindEvents();
  },

  bindEvents() {
    const form = document.getElementById('scan-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Listen for scan events via WebSocket
    window.wsClient.on('scan-event', (event) => this.handleScanEvent(event));
    // Also listen by specific type
    window.wsClient.on('start', (event) => this.handleScanEvent(event));
    window.wsClient.on('progress', (event) => this.handleScanEvent(event));
    window.wsClient.on('module-complete', (event) => this.handleScanEvent(event));
    window.wsClient.on('done', (event) => this.handleScanEvent(event));
    window.wsClient.on('error', (event) => this.handleScanEvent(event));
  },

  currentScanId: null,

  async handleSubmit() {
    const urlInput = document.getElementById('scan-url');
    const submitBtn = document.getElementById('scan-submit-btn');
    const url = urlInput.value.trim();

    if (!url) {
      Toast.warning('Missing URL', 'Please enter a target URL');
      return;
    }

    // Get selected modules
    const modules = Array.from(
      document.querySelectorAll('.module-select-grid input[type="checkbox"]:checked:not(:disabled)')
    ).map((cb) => cb.value);

    if (modules.length === 0) {
      Toast.warning('No Modules', 'Please select at least one module');
      return;
    }

    // Disable form
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div> Starting...';

    try {
      const result = await ApiClient.startScan(url, modules);
      this.currentScanId = result.scanId;

      // Subscribe to this specific scan on WebSocket
      if (window.wsClient && typeof window.wsClient.subscribe === 'function') {
        window.wsClient.subscribe(result.scanId);
      }

      // Show progress area
      document.getElementById('scan-progress-area').classList.remove('hidden');
      document.getElementById('scan-results-area').classList.add('hidden');
      document.getElementById('scan-results-area').innerHTML = '';
      document.getElementById('scan-log').innerHTML = '';

      this.addLogEntry(`Scan started: ${url}`, false);

      Toast.info('Scan Started', `Scanning ${url}...`);
    } catch (err) {
      Toast.error('Scan Failed', err.message);
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🎯 Start Scan';
    }
  },

  handleScanEvent(event) {
    if (!this.currentScanId || event.scanId !== this.currentScanId) return;

    const progressBar = document.getElementById('scan-progress-bar');
    const progressPercent = document.getElementById('scan-progress-percent');
    const progressStatus = document.getElementById('scan-progress-status');

    if (event.progress !== undefined && progressBar && progressPercent) {
      progressBar.style.width = `${event.progress}%`;
      progressPercent.textContent = `${event.progress}%`;
    }

    if (event.message) {
      this.addLogEntry(event.message, event.type === 'error');
    }

    if (progressStatus) {
      progressStatus.textContent = event.message || 'Scanning...';
    }

    // Scan completed — show results
    if (event.type === 'done') {
      this.onScanComplete();
    }

    // Module result received — render partial results
    if (event.type === 'module-complete' && event.data) {
      this.renderModuleResult(event.module, event.data);
    }

    if (event.type === 'error') {
      Toast.error('Scan Error', event.message);
      this.resetForm();
    }
  },

  addLogEntry(message, isError = false) {
    const log = document.getElementById('scan-log');
    if (!log) return;

    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `scan-log-entry ${isError ? 'error' : ''}`;
    entry.innerHTML = `<span class="time">[${time}]</span> <span class="msg">${message}</span>`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  },

  async onScanComplete() {
    Toast.success('Scan Complete', 'Technology profiling finished');

    // Fetch full results
    if (this.currentScanId) {
      try {
        const scan = await ApiClient.getScan(this.currentScanId);
        if (scan.results) {
          for (const result of scan.results) {
            this.renderModuleResult(result.module, result.data);
          }
        }
      } catch {
        // Results already rendered via WebSocket
      }
    }

    this.resetForm();
  },

  renderModuleResult(module, data) {
    const area = document.getElementById('scan-results-area');
    area.classList.remove('hidden');

    if (module === 'profiler' && data.technologies) {
      ProfileResult.render(area, data);
    } else if (module === 'vuln-scanner' && data.vulnerabilities) {
      if (window.VulnResult) {
        window.VulnResult.render(area, data);
      }
    } else if (module === 'exploit-sim') {
      if (window.ExploitResult) {
        window.ExploitResult.render(area, data);
      }
    } else if (module === 'stress-tester' && data.totalRequests !== undefined) {
      if (window.StressResult) {
        window.StressResult.render(area, data);
      }
    }
  },

  resetForm() {
    if (window.wsClient && typeof window.wsClient.unsubscribe === 'function') {
      window.wsClient.unsubscribe();
    }
    const submitBtn = document.getElementById('scan-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="22" y1="12" x2="18" y2="12"></line>
          <line x1="6" y1="12" x2="2" y2="12"></line>
          <line x1="12" y1="6" x2="12" y2="2"></line>
          <line x1="12" y1="22" x2="12" y2="18"></line>
        </svg>
        Start Scan`;
    }
  },
};

window.ScanForm = ScanForm;
