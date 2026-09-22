/**
 * WebSec Auditor — Toast Notification System
 */
const Toast = {
  container: null,

  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },

  /**
   * Show a toast notification.
   * @param {'success'|'error'|'info'|'warning'} type
   * @param {string} title
   * @param {string} message
   * @param {number} duration — ms, default 4000
   */
  show(type, title, message = '', duration = 4000) {
    if (!this.container) this.init();

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠',
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ'}</span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <div class="toast-progress" style="animation-duration: ${duration}ms"></div>
    `;

    this.container.appendChild(toast);

    // Auto-remove
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(title, message) { this.show('success', title, message); },
  error(title, message)   { this.show('error', title, message, 6000); },
  info(title, message)    { this.show('info', title, message); },
  warning(title, message) { this.show('warning', title, message, 5000); },
};

window.Toast = Toast;
