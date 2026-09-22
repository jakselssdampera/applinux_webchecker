/**
 * WebSec Auditor — Request Repeater & Payload Generator Component (PRD 4.3)
 */
const RepeaterLab = {
  payloads: [],

  async render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
          Request Repeater & Exploit Lab
        </h1>
        <p>Craft, mutate, and replay HTTP requests with customized security payloads (PRD Phase 3).</p>
      </div>

      <!-- Payload Generator Toolbar -->
      <div class="glass-card mb-lg animate-fade-in">
        <div class="flex items-center justify-between flex-wrap gap-md">
          <div class="flex items-center gap-sm">
            <span style="font-size:0.9rem;font-weight:600;color:var(--text-light);">⚡ Payload Generator:</span>
            <select id="repeater-payload-select" class="form-input" style="width:280px;font-size:0.85rem;padding:0.4rem 0.6rem;">
              <option value="">-- Choose Security Payload --</option>
            </select>
          </div>
          <div class="flex items-center gap-sm">
            <button id="btn-insert-url" class="btn btn-secondary" style="font-size:0.8rem;padding:0.4rem 0.8rem;">
              Insert into URL
            </button>
            <button id="btn-insert-body" class="btn btn-secondary" style="font-size:0.8rem;padding:0.4rem 0.8rem;">
              Insert into Body
            </button>
          </div>
        </div>
      </div>

      <!-- Main Repeater Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;" id="repeater-main-grid">
        <!-- Request Panel -->
        <div class="glass-card animate-slide-up">
          <h3 class="mb-md flex items-center justify-between">
            <span>Request</span>
            <button id="btn-send-request" class="btn btn-primary" style="padding:6px 14px;font-size:0.85rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Send Request
            </button>
          </h3>

          <div class="form-group mb-sm">
            <label class="form-label" style="font-size:0.8rem;">Target URL & Method</label>
            <div style="display:flex;gap:0.5rem;">
              <select id="req-method" class="form-input" style="width:110px;font-weight:700;color:var(--cyan);">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="HEAD">HEAD</option>
                <option value="PATCH">PATCH</option>
              </select>
              <input type="text" id="req-url" class="form-input" placeholder="https://example.com/api?param=value" style="flex:1;">
            </div>
          </div>

          <div class="form-group mb-sm">
            <label class="form-label" style="font-size:0.8rem;">Custom Headers (JSON or Key: Value per line)</label>
            <textarea id="req-headers" class="form-input" rows="4" style="font-family:monospace;font-size:0.8rem;" placeholder="User-Agent: WebSecAuditor/1.0&#10;X-Custom-Header: test"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-size:0.8rem;">Request Body</label>
            <textarea id="req-body" class="form-input" rows="7" style="font-family:monospace;font-size:0.8rem;" placeholder='{"search": "test"}'></textarea>
          </div>
        </div>

        <!-- Response Panel -->
        <div class="glass-card animate-slide-up">
          <div class="flex items-center justify-between mb-md">
            <h3>Response</h3>
            <div id="resp-meta" class="flex items-center gap-sm">
              <span class="text-muted" style="font-size:0.85rem;">Ready</span>
            </div>
          </div>

          <div id="resp-container" style="min-height:350px;">
            <div class="empty-state" style="padding:3rem 1rem;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              <p class="mt-sm text-muted">Configure your request and click "Send Request" to inspect the live response.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Load payload catalog
    await this.loadPayloads();

    // Event listeners
    this.bindEvents();
  },

  async loadPayloads() {
    try {
      const res = await fetch('/api/exploit/payloads');
      if (res.ok) {
        const data = await res.json();
        this.payloads = data.payloads || [];
      }
    } catch {
      this.payloads = [];
    }

    const select = document.getElementById('repeater-payload-select');
    if (!select) return;

    if (this.payloads.length === 0) {
      select.innerHTML = '<option value="">No payloads loaded</option>';
      return;
    }

    let optionsHtml = '<option value="">-- Choose Security Payload --</option>';
    const grouped = {};
    for (const p of this.payloads) {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    }

    for (const [cat, list] of Object.entries(grouped)) {
      optionsHtml += `<optgroup label="${cat.toUpperCase()}">`;
      for (const p of list) {
        optionsHtml += `<option value="${this.escape(p.payload)}">${this.escape(p.name)}</option>`;
      }
      optionsHtml += `</optgroup>`;
    }
    select.innerHTML = optionsHtml;
  },

  bindEvents() {
    const payloadSelect = document.getElementById('repeater-payload-select');
    const btnInsertUrl = document.getElementById('btn-insert-url');
    const btnInsertBody = document.getElementById('btn-insert-body');
    const btnSend = document.getElementById('btn-send-request');
    const urlInput = document.getElementById('req-url');
    const bodyInput = document.getElementById('req-body');

    btnInsertUrl?.addEventListener('click', () => {
      const val = payloadSelect.value;
      if (!val) {
        Toast.warning('Select Payload', 'Please pick a payload from the dropdown first');
        return;
      }
      urlInput.value += (urlInput.value.includes('?') ? '&q=' : '?q=') + encodeURIComponent(val);
      Toast.success('Inserted', 'Payload appended to URL query');
    });

    btnInsertBody?.addEventListener('click', () => {
      const val = payloadSelect.value;
      if (!val) {
        Toast.warning('Select Payload', 'Please pick a payload from the dropdown first');
        return;
      }
      bodyInput.value += val;
      Toast.success('Inserted', 'Payload inserted into request body');
    });

    btnSend?.addEventListener('click', () => this.sendRequest());
  },

  async sendRequest() {
    const url = document.getElementById('req-url')?.value?.trim();
    const method = document.getElementById('req-method')?.value || 'GET';
    const rawHeaders = document.getElementById('req-headers')?.value || '';
    const body = document.getElementById('req-body')?.value || undefined;

    if (!url) {
      Toast.warning('Missing URL', 'Please enter a target URL');
      return;
    }

    // Parse headers
    const headers = {};
    const lines = rawHeaders.split('\n');
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx > 0) {
        const k = line.slice(0, idx).trim();
        const v = line.slice(idx + 1).trim();
        if (k && v) headers[k] = v;
      }
    }

    const respContainer = document.getElementById('resp-container');
    const respMeta = document.getElementById('resp-meta');

    respMeta.innerHTML = `<div class="spinner spinner-sm"></div> <span class="text-muted">Sending...</span>`;
    respContainer.innerHTML = `<div class="empty-state"><div class="spinner spinner-lg"></div><p class="mt-md">Awaiting response...</p></div>`;

    try {
      const res = await fetch('/api/exploit/repeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, method, headers, body }),
      });

      const data = await res.json();

      if (!res.ok) {
        respMeta.innerHTML = `<span class="badge badge-danger">Error ${res.status}</span>`;
        respContainer.innerHTML = `
          <div class="glass-card" style="border-left:4px solid var(--rose);">
            <strong style="color:var(--rose);">Request Failed</strong>
            <p class="mt-xs text-muted">${this.escape(data.error || 'Unknown error occurred')}</p>
          </div>
        `;
        return;
      }

      // Render response
      const statusColor =
        data.statusCode >= 200 && data.statusCode < 300
          ? 'var(--emerald)'
          : data.statusCode >= 400 && data.statusCode < 500
          ? 'var(--amber)'
          : 'var(--rose)';

      respMeta.innerHTML = `
        <span class="badge" style="background:${statusColor}20;color:${statusColor};border:1px solid ${statusColor};">
          ${data.statusCode} ${data.statusText}
        </span>
        <span class="badge badge-info">${data.responseTimeMs} ms</span>
        <span class="badge badge-info">${data.sizeBytes} bytes</span>
      `;

      let headersList = '';
      for (const [k, v] of Object.entries(data.headers || {})) {
        headersList += `<div><span style="color:var(--cyan);">${this.escape(k)}:</span> <span style="color:var(--text-light);">${this.escape(v)}</span></div>`;
      }

      respContainer.innerHTML = `
        <div class="mb-sm">
          <label class="form-label" style="font-size:0.75rem;text-transform:uppercase;">Response Headers</label>
          <div style="background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:0.375rem;padding:0.6rem;font-family:monospace;font-size:0.75rem;max-height:120px;overflow-y:auto;">
            ${headersList || '<span class="text-muted">None</span>'}
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-xs">
            <label class="form-label" style="font-size:0.75rem;text-transform:uppercase;">Response Body</label>
            <button class="btn btn-ghost" style="padding:2px 8px;font-size:0.75rem;" onclick="navigator.clipboard.writeText(${JSON.stringify(data.body)});Toast.success('Copied', 'Response body copied')">
              Copy Body
            </button>
          </div>
          <pre style="background:rgba(0,0,0,0.4);border:1px solid var(--border);border-radius:0.375rem;padding:0.75rem;font-family:monospace;font-size:0.8rem;max-height:360px;overflow:auto;color:var(--text-light);"><code>${this.escape(data.body)}</code></pre>
        </div>
      `;
    } catch (err) {
      respMeta.innerHTML = `<span class="badge badge-danger">Network Error</span>`;
      respContainer.innerHTML = `
        <div class="glass-card" style="border-left:4px solid var(--rose);">
          <p class="text-muted">${this.escape(err.message)}</p>
        </div>
      `;
    }
  },

  escape(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};

window.RepeaterLab = RepeaterLab;
