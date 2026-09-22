/**
 * WebSec Auditor — Main Application
 * SPA router and initialization.
 */
const App = {
  currentPage: null,

  async init() {
    // Initialize toast system
    Toast.init();

    // Initialize sidebar
    Sidebar.init();

    // Connect WebSocket
    window.wsClient.connect();

    // Check consent before anything else
    await ConsentModal.ensureConsent();

    // Setup router
    window.addEventListener('hashchange', () => this.route());
    this.route();
  },

  /**
   * Hash-based SPA router.
   */
  route() {
    const hash = location.hash.slice(1) || 'dashboard';
    const [page, ...params] = hash.split('/');

    this.currentPage = page;
    Sidebar.updateActiveLink();

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    switch (page) {
      case 'dashboard':
        this.renderDashboard(mainContent);
        break;
      case 'scan':
        ScanForm.render(mainContent);
        break;
      case 'history':
        this.renderHistory(mainContent);
        break;
      case 'results':
        this.renderScanResults(mainContent, params[0]);
        break;
      default:
        this.renderDashboard(mainContent);
    }
  },

  /**
   * Dashboard page — overview with stats and recent scans.
   */
  async renderDashboard(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1"></rect>
          </svg>
          Dashboard
        </h1>
        <p>Welcome to WebSec Auditor. Start a scan or review recent activity.</p>
      </div>

      <div class="stats-grid" id="dashboard-stats">
        <div class="glass-card stat-card animate-fade-in stagger-1">
          <div class="stat-card-label">Total Scans</div>
          <div class="stat-card-value cyan" id="stat-total">—</div>
        </div>
        <div class="glass-card stat-card animate-fade-in stagger-2">
          <div class="stat-card-label">Completed</div>
          <div class="stat-card-value emerald" id="stat-completed">—</div>
        </div>
        <div class="glass-card stat-card animate-fade-in stagger-3">
          <div class="stat-card-label">Running</div>
          <div class="stat-card-value amber" id="stat-running">—</div>
        </div>
        <div class="glass-card stat-card animate-fade-in stagger-4">
          <div class="stat-card-label">Failed</div>
          <div class="stat-card-value rose" id="stat-failed">—</div>
        </div>
      </div>

      <div class="flex items-center justify-between mb-md">
        <h2>Recent Scans</h2>
        <a href="#scan" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Scan
        </a>
      </div>

      <div class="glass-card animate-fade-in" id="recent-scans-container">
        <div class="empty-state">
          <div class="spinner spinner-lg"></div>
          <p class="mt-md">Loading scans...</p>
        </div>
      </div>
    `;

    // Fetch data
    try {
      const stats = await ApiClient.getStats();
      document.getElementById('stat-total').textContent = stats.total || 0;
      document.getElementById('stat-completed').textContent = stats.completed || 0;
      document.getElementById('stat-running').textContent = stats.running || 0;
      document.getElementById('stat-failed').textContent = stats.failed || 0;

      const data = await ApiClient.listScans(10);
      const scans = data.scans || [];

      // Render recent scans table
      const tableContainer = document.getElementById('recent-scans-container');
      if (scans.length === 0) {
        tableContainer.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="22" y1="12" x2="18" y2="12"></line>
              <line x1="6" y1="12" x2="2" y2="12"></line>
              <line x1="12" y1="6" x2="12" y2="2"></line>
              <line x1="12" y1="22" x2="12" y2="18"></line>
            </svg>
            <p>No scans yet. <a href="#scan">Start your first scan</a>.</p>
          </div>
        `;
      } else {
        tableContainer.innerHTML = this.renderScansTable(scans);
      }
    } catch (err) {
      Toast.error('Failed to load data', err.message);
    }
  },

  /**
   * History page — full scan history.
   */
  async renderHistory(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Scan History
        </h1>
        <p>View all past scans and their results.</p>
      </div>

      <div class="glass-card animate-fade-in" id="history-container">
        <div class="empty-state">
          <div class="spinner spinner-lg"></div>
          <p class="mt-md">Loading history...</p>
        </div>
      </div>
    `;

    try {
      const data = await ApiClient.listScans(100);
      const historyContainer = document.getElementById('history-container');

      if (!data.scans || data.scans.length === 0) {
        historyContainer.innerHTML = `
          <div class="empty-state">
            <p>No scans recorded yet.</p>
          </div>
        `;
      } else {
        historyContainer.innerHTML = this.renderScansTable(data.scans);
      }
    } catch (err) {
      Toast.error('Failed to load history', err.message);
    }
  },

  /**
   * Render scan results for a specific scan ID.
   */
  async renderScanResults(container, scanId) {
    if (!scanId) {
      location.hash = '#dashboard';
      return;
    }

    container.innerHTML = `
      <div class="page-header">
        <h1>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          Scan Results
        </h1>
        <p class="text-mono" style="font-size:0.85rem;">ID: ${scanId}</p>
      </div>
      <div id="scan-detail-results">
        <div class="empty-state"><div class="spinner spinner-lg"></div><p class="mt-md">Loading results...</p></div>
      </div>
    `;

    try {
      const scan = await ApiClient.getScan(scanId);
      const resultsContainer = document.getElementById('scan-detail-results');

      if (scan.results) {
        resultsContainer.innerHTML = ''; // clear loading state
        for (const result of scan.results) {
          if (result.module === 'profiler' && result.data) {
            ProfileResult.render(resultsContainer, result.data);
          } else if (result.module === 'vuln-scanner' && result.data && window.VulnResult) {
            window.VulnResult.render(resultsContainer, result.data);
          }
        }
      } else {
        resultsContainer.innerHTML = '<div class="empty-state"><p>No results found.</p></div>';
      }
    } catch (err) {
      Toast.error('Failed to load results', err.message);
    }
  },

  /**
   * Render a table of scans.
   */
  renderScansTable(scans) {
    return `
      <table class="scan-history-table">
        <thead>
          <tr>
            <th>Target</th>
            <th>Status</th>
            <th>Modules</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${scans.map((scan) => `
            <tr onclick="location.hash='#results/${scan.id}'">
              <td class="url-cell">${this.escapeHtml(scan.targetUrl)}</td>
              <td>
                <span class="status-badge ${scan.status}">
                  <span class="dot"></span>
                  ${scan.status}
                </span>
              </td>
              <td>${(scan.modules || []).map((m) => `<span class="badge badge-info" style="margin-right:4px;">${m}</span>`).join('')}</td>
              <td class="text-muted" style="font-size:0.8rem;">${this.formatDate(scan.createdAt)}</td>
              <td>
                <a href="#results/${scan.id}" class="btn btn-ghost" style="padding:6px 12px;font-size:0.8rem;">View →</a>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};

// Boot the application
document.addEventListener('DOMContentLoaded', () => App.init());
