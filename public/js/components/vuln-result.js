/**
 * WebSec Auditor — Vuln Scanner Result Component
 */
const VulnResult = {
  render(container, data) {
    if (!data.vulnerabilities) return;

    // Create wrapper if not exists
    let wrapper = container.querySelector('#vuln-result-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.id = 'vuln-result-wrapper';
      wrapper.className = 'glass-card mt-lg animate-fade-in';
      container.appendChild(wrapper);
    }

    const vulnCount = data.vulnerabilities.length;
    
    // Group vulnerabilities by severity
    const grouped = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: []
    };
    
    data.vulnerabilities.forEach(v => {
      if (grouped[v.severity]) {
        grouped[v.severity].push(v);
      }
    });

    const severityColors = {
      critical: 'var(--danger)',
      high: '#ff9800',
      medium: 'var(--warning)',
      low: 'var(--cyan)',
      info: 'var(--text-muted)'
    };

    let html = `
      <div class="result-header mb-lg">
        <h2>🛡️ Vulnerability Report</h2>
        <div class="result-meta">
          <span>Target: <span class="highlight">${data.targetUrl}</span></span>
          <span>Crawled URLs: <span class="highlight">${data.crawledUrls ? data.crawledUrls.length : 0}</span></span>
        </div>
      </div>
    `;

    if (vulnCount === 0) {
      html += `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h3>No Vulnerabilities Found</h3>
          <p>The basic vulnerability scan did not detect any common misconfigurations or injection flaws.</p>
        </div>
      `;
    } else {
      html += `<div class="vuln-summary mb-lg" style="display:flex;gap:1rem;flex-wrap:wrap;">`;
      
      // Summary badges
      for (const [sev, list] of Object.entries(grouped)) {
        if (list.length > 0) {
          html += `
            <div style="background:rgba(255,255,255,0.05);padding:0.75rem 1rem;border-radius:0.5rem;border-left:4px solid ${severityColors[sev]}">
              <div style="font-size:0.875rem;color:var(--text-muted);text-transform:uppercase;">${sev}</div>
              <div style="font-size:1.5rem;font-weight:600;color:var(--text-light);">${list.length}</div>
            </div>
          `;
        }
      }
      html += `</div><div class="vuln-list">`;

      // Render individual vulnerabilities
      for (const [sev, list] of Object.entries(grouped)) {
        for (const vuln of list) {
          html += `
            <div class="vuln-item" style="border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;margin-bottom:1rem;overflow:hidden;">
              <div class="vuln-item-header" style="background:rgba(0,0,0,0.2);padding:1rem;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <span style="display:inline-block;padding:0.25rem 0.5rem;border-radius:0.25rem;font-size:0.75rem;font-weight:600;text-transform:uppercase;background:${severityColors[sev]}20;color:${severityColors[sev]};margin-right:0.75rem;">
                    ${sev}
                  </span>
                  <span style="font-weight:600;color:var(--text-light);">${vuln.title}</span>
                </div>
              </div>
              <div class="vuln-item-body" style="padding:1rem;">
                <p style="margin-top:0;margin-bottom:1rem;color:var(--text-muted);">${vuln.description}</p>
                
                <div style="display:grid;grid-template-columns:120px 1fr;gap:0.5rem;font-size:0.875rem;margin-bottom:1rem;">
                  <div style="color:var(--text-muted);">URL:</div>
                  <div style="word-break:break-all;color:var(--cyan);">${vuln.url}</div>
                  
                  ${vuln.parameter ? `
                    <div style="color:var(--text-muted);">Parameter:</div>
                    <div><code style="background:rgba(255,255,255,0.1);padding:0.1rem 0.3rem;border-radius:0.25rem;">${vuln.parameter}</code></div>
                  ` : ''}
                </div>

                <div style="background:rgba(0,0,0,0.3);padding:1rem;border-radius:0.5rem;margin-bottom:1rem;">
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.5rem;text-transform:uppercase;">Evidence</div>
                  <div style="font-family:monospace;font-size:0.875rem;color:var(--danger);">${vuln.evidence}</div>
                </div>

                <div style="background:rgba(var(--success-rgb), 0.1);padding:1rem;border-radius:0.5rem;border-left:3px solid var(--success);">
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.5rem;text-transform:uppercase;">Remediation</div>
                  <div style="font-size:0.875rem;color:var(--text-light);">${vuln.remediation}</div>
                </div>
              </div>
            </div>
          `;
        }
      }
      
      html += `</div>`;
    }

    wrapper.innerHTML = html;
  }
};

window.VulnResult = VulnResult;
