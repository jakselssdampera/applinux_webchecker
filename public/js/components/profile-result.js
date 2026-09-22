/**
 * WebSec Auditor — Profile Result Renderer
 * Renders technology profiling results as categorized cards with confidence meters.
 */
const ProfileResult = {
  /** Category display config */
  categories: {
    'web-server':     { label: 'Web Server',      icon: '🖥️' },
    'framework':      { label: 'Framework',        icon: '⚙️' },
    'cms':            { label: 'CMS',              icon: '📝' },
    'js-library':     { label: 'JavaScript',       icon: '📦' },
    'css-framework':  { label: 'CSS Framework',    icon: '🎨' },
    'language':       { label: 'Language',          icon: '💻' },
    'waf':            { label: 'WAF / Firewall',   icon: '🔥' },
    'cdn':            { label: 'CDN / Hosting',     icon: '☁️' },
    'os':             { label: 'Operating System',  icon: '🐧' },
    'analytics':      { label: 'Analytics',         icon: '📊' },
    'other':          { label: 'Other',             icon: '🔧' },
  },

  /**
   * Render the full profile result into a container.
   * @param {HTMLElement} container
   * @param {object} data — ProfileResult from the backend
   */
  render(container, data) {
    // Group technologies by category
    const grouped = {};
    for (const tech of data.technologies || []) {
      const cat = tech.category || 'other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(tech);
    }

    const totalTechs = data.technologies?.length || 0;

    let html = `
      <!-- Summary stats -->
      <div class="stats-grid animate-fade-in">
        <div class="glass-card stat-card">
          <div class="stat-card-label">Technologies Found</div>
          <div class="stat-card-value cyan">${totalTechs}</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-card-label">Response Time</div>
          <div class="stat-card-value emerald">${data.responseTime || 0}<span style="font-size:0.9rem;color:var(--text-muted)">ms</span></div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-card-label">Status Code</div>
          <div class="stat-card-value ${data.statusCode < 400 ? 'emerald' : 'rose'}">${data.statusCode || '—'}</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-card-label">Redirects</div>
          <div class="stat-card-value amber">${data.redirectChain?.length || 0}</div>
        </div>
      </div>
    `;

    // Technology cards by category
    if (totalTechs > 0) {
      html += `<h2 class="mb-md" style="display:flex;align-items:center;gap:8px;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        Detected Technologies
      </h2>`;

      html += '<div class="result-grid">';

      let staggerIndex = 0;
      for (const [category, techs] of Object.entries(grouped)) {
        const catConfig = this.categories[category] || this.categories['other'];
        staggerIndex++;

        html += `
          <div class="glass-card tech-card stagger-${Math.min(staggerIndex, 6)}">
            <div class="tech-card-header">
              <div class="tech-card-title">
                <span class="tech-card-icon ${category}">${catConfig.icon}</span>
                ${catConfig.label}
              </div>
              <span class="badge badge-info">${techs.length}</span>
            </div>
            <div class="tech-items">
              ${techs.map((tech) => this.renderTechItem(tech)).join('')}
            </div>
          </div>
        `;
      }

      html += '</div>';
    } else {
      html += `
        <div class="glass-card animate-fade-in">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/>
            </svg>
            <p>No technologies detected. The target may be blocking fingerprinting.</p>
          </div>
        </div>
      `;
    }

    // Response Headers section
    if (data.headers && Object.keys(data.headers).length > 0) {
      html += `
        <div class="glass-card mt-lg animate-fade-in">
          <h3 class="mb-md" style="display:flex;align-items:center;gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            Response Headers
          </h3>
          <table class="headers-table">
            <tbody>
              ${Object.entries(data.headers)
                .filter(([_, v]) => v)
                .map(([key, value]) => `
                  <tr>
                    <td class="header-name">${this.escapeHtml(key)}</td>
                    <td class="header-value">${this.escapeHtml(Array.isArray(value) ? value.join(', ') : String(value))}</td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = html;
  },

  /**
   * Render a single tech item with confidence meter.
   */
  renderTechItem(tech) {
    const confidenceClass =
      tech.confidence >= 80 ? 'high' :
      tech.confidence >= 50 ? 'medium' : 'low';

    const confidenceColor =
      tech.confidence >= 80 ? 'var(--emerald-light)' :
      tech.confidence >= 50 ? 'var(--amber-light)' : 'var(--rose-light)';

    return `
      <div class="tech-item">
        <div>
          <div class="tech-item-name">
            ${this.escapeHtml(tech.name)}
            ${tech.version ? `<span class="tech-item-version">v${this.escapeHtml(tech.version)}</span>` : ''}
          </div>
          <div class="tech-item-evidence">${this.escapeHtml(tech.evidence || '')}</div>
        </div>
        <div class="confidence-meter">
          <div class="confidence-bar">
            <div class="confidence-bar-fill ${confidenceClass}" style="width: ${tech.confidence}%"></div>
          </div>
          <span class="confidence-value" style="color: ${confidenceColor}">${tech.confidence}%</span>
        </div>
      </div>
    `;
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};

window.ProfileResult = ProfileResult;
