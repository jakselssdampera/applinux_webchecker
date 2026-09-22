/**
 * WebSec Auditor — Sidebar Navigation
 */
const Sidebar = {
  init() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon">🛡️</div>
          <div>
            <div class="sidebar-logo-text">WebSec Auditor</div>
            <div class="sidebar-logo-version">v0.1.0 — Phase 1</div>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-section-label">Main</div>

        <a class="sidebar-link" href="#dashboard" data-page="dashboard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1"></rect>
          </svg>
          Dashboard
        </a>

        <a class="sidebar-link" href="#scan" data-page="scan">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="22" y1="12" x2="18" y2="12"></line>
            <line x1="6" y1="12" x2="2" y2="12"></line>
            <line x1="12" y1="6" x2="12" y2="2"></line>
            <line x1="12" y1="22" x2="12" y2="18"></line>
          </svg>
          New Scan
        </a>

        <a class="sidebar-link" href="#history" data-page="history">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          History
        </a>

        <div class="sidebar-section-label">Modules</div>

        <a class="sidebar-link" href="#scan" data-page="scan">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Tech Profiler
        </a>

        <a class="sidebar-link" href="#scan" data-page="scan">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
          </svg>
          Vuln Scanner
        </a>

        <a class="sidebar-link" href="#repeater" data-page="repeater">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
          Exploit Repeater
          <span class="badge badge-success" style="margin-left:auto;font-size:0.6rem;">LAB</span>
        </a>

        <a class="sidebar-link" href="#scan" data-page="scan">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          Stress Test
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-status">
          <span class="status-dot" id="ws-status-dot"></span>
          <span id="ws-status-text">Connecting...</span>
        </div>
      </div>
    `;

    // Highlight active link
    this.updateActiveLink();

    // Update WebSocket status
    window.wsClient.on('connection', ({ connected }) => {
      const dot = document.getElementById('ws-status-dot');
      const text = document.getElementById('ws-status-text');
      if (dot && text) {
        dot.className = `status-dot ${connected ? '' : 'disconnected'}`;
        text.textContent = connected ? 'Connected' : 'Disconnected';
      }
    });
  },

  updateActiveLink() {
    const currentPage = location.hash.slice(1).split('/')[0] || 'dashboard';
    document.querySelectorAll('.sidebar-link').forEach((link) => {
      const page = link.dataset.page;
      link.classList.toggle('active', page === currentPage);
    });
  },
};

window.Sidebar = Sidebar;
