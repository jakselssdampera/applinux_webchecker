/**
 * Component to render Stress Tester results.
 */
const StressResult = {
  render(container, data) {
    if (!data) return;
    
    // Safety check in case the module is a placeholder
    if (data.message) {
      const el = document.createElement('div');
      el.className = 'glass-card animate-slide-up mt-md';
      el.innerHTML = `<h3>Stress Tester</h3><p>${data.message}</p>`;
      container.appendChild(el);
      return;
    }

    const el = document.createElement('div');
    el.className = 'glass-card animate-slide-up mt-lg';
    
    // Format error distribution
    let errorRows = '';
    if (Object.keys(data.errorDistribution || {}).length > 0) {
      errorRows = Object.entries(data.errorDistribution).map(([code, count]) => 
        `<tr><td><code>${code}</code></td><td>${count}</td></tr>`
      ).join('');
    } else {
      errorRows = `<tr><td colspan="2" class="text-muted">No errors encountered</td></tr>`;
    }

    el.innerHTML = `
      <div class="flex items-center gap-sm mb-md">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        <h3>Stress & Load Testing Results</h3>
      </div>
      
      <div class="stats-grid mb-lg" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
        <div class="glass-card stat-card">
          <div class="stat-card-label">Total Requests</div>
          <div class="stat-card-value cyan">${data.totalRequests.toLocaleString()}</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-card-label">Requests/sec</div>
          <div class="stat-card-value emerald">${data.requestsPerSecond.toLocaleString()}</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-card-label">Success Rate</div>
          <div class="stat-card-value ${data.successRate > 90 ? 'emerald' : data.successRate > 50 ? 'amber' : 'rose'}">
            ${data.successRate.toFixed(1)}%
          </div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-card-label">Avg Latency</div>
          <div class="stat-card-value amber">${data.latency.avg} ms</div>
        </div>
      </div>
      
      <div class="flex-col gap-md mb-md">
        <h4>Latency Breakdown</h4>
        <div class="progress-bar" style="height: 12px; background: var(--bg-tertiary);">
          <div class="progress-bar-fill" style="width: 100%; background: linear-gradient(90deg, var(--cyan), var(--rose));"></div>
        </div>
        <div class="flex justify-between text-mono" style="font-size: 0.8rem; color: var(--text-secondary);">
          <span>Min: ${data.latency.min} ms</span>
          <span>Max: ${data.latency.max} ms</span>
        </div>
      </div>
      
      <h4>Error Distribution</h4>
      <table class="scan-history-table mt-sm" style="font-size: 0.9rem;">
        <thead>
          <tr>
            <th>Error Code / Status</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          ${errorRows}
        </tbody>
      </table>
    `;
    
    container.appendChild(el);
  }
};

window.StressResult = StressResult;
