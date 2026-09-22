/**
 * WebSec Auditor — Authorization Consent Modal
 *
 * Per PRD Section 6: Must appear on every app launch.
 * User must explicitly accept the disclaimer before using any features.
 */
const ConsentModal = {
  /**
   * Show the consent modal. Returns a promise that resolves when user accepts.
   */
  async show() {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'consent-overlay';
      overlay.id = 'consent-overlay';

      overlay.innerHTML = `
        <div class="consent-modal">
          <div class="consent-icon">🛡️</div>
          <h2 class="consent-title">Authorization Required</h2>
          <p class="consent-text">
            <strong>WebSec Auditor</strong> is a security testing tool designed for
            <strong>authorized penetration testing</strong> and <strong>security auditing</strong> only.
          </p>
          <div class="consent-warning-box">
            <ul>
              <li>Unauthorized access to computer systems is <strong>illegal</strong></li>
              <li>You must have <strong>written permission</strong> from the system owner</li>
              <li>All testing activity is <strong>logged</strong> for accountability</li>
              <li>You are <strong>solely responsible</strong> for your actions</li>
            </ul>
          </div>
          <div class="consent-checkbox-area">
            <label class="checkbox-group" id="consent-label">
              <input type="checkbox" id="consent-checkbox">
              <span>I confirm that I have legal authorization to test the target systems</span>
            </label>
          </div>
          <button class="btn btn-danger consent-btn" id="consent-accept-btn" disabled>
            🔓 I Agree & Continue
          </button>
        </div>
      `;

      document.body.appendChild(overlay);

      const checkbox = document.getElementById('consent-checkbox');
      const acceptBtn = document.getElementById('consent-accept-btn');

      checkbox.addEventListener('change', () => {
        acceptBtn.disabled = !checkbox.checked;
      });

      acceptBtn.addEventListener('click', async () => {
        try {
          await ApiClient.submitConsent();
          overlay.style.animation = 'fadeOut 0.3s ease both';
          setTimeout(() => {
            overlay.remove();
            resolve(true);
          }, 300);
        } catch (err) {
          Toast.error('Consent Failed', err.message);
        }
      });
    });
  },

  /**
   * Check if consent is already given, show modal if not.
   */
  async ensureConsent() {
    try {
      const status = await ApiClient.checkConsent();
      if (!status.consented) {
        await this.show();
      }
    } catch {
      // If server is down, show modal anyway
      await this.show();
    }
  },
};

window.ConsentModal = ConsentModal;
