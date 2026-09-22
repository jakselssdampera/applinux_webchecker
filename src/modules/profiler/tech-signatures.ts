import type { TechSignature } from './types.js';

/**
 * Comprehensive signature database for technology fingerprinting.
 * Each signature contains patterns to match against HTTP headers, HTML content, etc.
 */
export const TECH_SIGNATURES: TechSignature[] = [
  // ─── Web Servers ──────────────────────────────
  {
    name: 'Nginx',
    category: 'web-server',
    patterns: [
      { source: 'header', key: 'server', pattern: /nginx\/?(\d[\d.]*)?/i, versionGroup: 1, confidence: 95 },
      { source: 'header', key: 'x-powered-by', pattern: /nginx/i, confidence: 70 },
    ],
  },
  {
    name: 'Apache',
    category: 'web-server',
    patterns: [
      { source: 'header', key: 'server', pattern: /Apache\/?(\d[\d.]*)?/i, versionGroup: 1, confidence: 95 },
      { source: 'header', key: 'x-powered-by', pattern: /apache/i, confidence: 70 },
    ],
  },
  {
    name: 'Microsoft IIS',
    category: 'web-server',
    patterns: [
      { source: 'header', key: 'server', pattern: /Microsoft-IIS\/?(\d[\d.]*)?/i, versionGroup: 1, confidence: 95 },
    ],
  },
  {
    name: 'LiteSpeed',
    category: 'web-server',
    patterns: [
      { source: 'header', key: 'server', pattern: /LiteSpeed/i, confidence: 95 },
    ],
  },
  {
    name: 'Caddy',
    category: 'web-server',
    patterns: [
      { source: 'header', key: 'server', pattern: /Caddy/i, confidence: 95 },
    ],
  },

  // ─── Programming Languages ────────────────────
  {
    name: 'PHP',
    category: 'language',
    patterns: [
      { source: 'header', key: 'x-powered-by', pattern: /PHP\/?(\d[\d.]*)?/i, versionGroup: 1, confidence: 95 },
      { source: 'cookie', key: 'PHPSESSID', pattern: /PHPSESSID/i, confidence: 85 },
      { source: 'html', pattern: /\.php(?:\?|"|'|$)/i, confidence: 50 },
    ],
  },
  {
    name: 'ASP.NET',
    category: 'language',
    patterns: [
      { source: 'header', key: 'x-powered-by', pattern: /ASP\.NET/i, confidence: 95 },
      { source: 'header', key: 'x-aspnet-version', pattern: /(\d[\d.]*)/i, versionGroup: 1, confidence: 95 },
      { source: 'cookie', key: 'ASP.NET_SessionId', pattern: /ASP\.NET_SessionId/i, confidence: 90 },
      { source: 'html', pattern: /__VIEWSTATE/i, confidence: 85 },
    ],
  },
  {
    name: 'Node.js',
    category: 'language',
    patterns: [
      { source: 'header', key: 'x-powered-by', pattern: /Express/i, confidence: 90 },
      { source: 'cookie', key: 'connect.sid', pattern: /connect\.sid/i, confidence: 80 },
    ],
  },
  {
    name: 'Python',
    category: 'language',
    patterns: [
      { source: 'header', key: 'server', pattern: /Python\/?(\d[\d.]*)?/i, versionGroup: 1, confidence: 85 },
      { source: 'header', key: 'x-powered-by', pattern: /Django|Flask|FastAPI/i, confidence: 80 },
      { source: 'header', key: 'server', pattern: /gunicorn|uvicorn|waitress/i, confidence: 80 },
    ],
  },
  {
    name: 'Ruby',
    category: 'language',
    patterns: [
      { source: 'header', key: 'x-powered-by', pattern: /Phusion Passenger/i, confidence: 85 },
      { source: 'header', key: 'server', pattern: /Passenger|Puma|Unicorn/i, confidence: 80 },
      { source: 'cookie', key: '_session_id', pattern: /_session_id/i, confidence: 40 },
    ],
  },
  {
    name: 'Java',
    category: 'language',
    patterns: [
      { source: 'header', key: 'x-powered-by', pattern: /Servlet|JSP/i, confidence: 90 },
      { source: 'cookie', key: 'JSESSIONID', pattern: /JSESSIONID/i, confidence: 90 },
      { source: 'header', key: 'server', pattern: /Tomcat|Jetty|WildFly|GlassFish/i, confidence: 85 },
    ],
  },

  // ─── Frameworks ───────────────────────────────
  {
    name: 'Laravel',
    category: 'framework',
    patterns: [
      { source: 'cookie', key: 'laravel_session', pattern: /laravel_session/i, confidence: 95 },
      { source: 'header', key: 'set-cookie', pattern: /laravel_session/i, confidence: 95 },
      { source: 'html', pattern: /csrf-token/i, confidence: 30 },
    ],
  },
  {
    name: 'Django',
    category: 'framework',
    patterns: [
      { source: 'cookie', key: 'csrftoken', pattern: /csrftoken/i, confidence: 75 },
      { source: 'header', key: 'set-cookie', pattern: /csrftoken/i, confidence: 75 },
      { source: 'html', pattern: /csrfmiddlewaretoken/i, confidence: 85 },
    ],
  },
  {
    name: 'Ruby on Rails',
    category: 'framework',
    patterns: [
      { source: 'header', key: 'x-powered-by', pattern: /Rails/i, confidence: 95 },
      { source: 'header', key: 'x-runtime', pattern: /\d+\.\d+/i, confidence: 60 },
      { source: 'html', pattern: /csrf-token.*authenticity_token/i, confidence: 80 },
      { source: 'cookie', key: '_rails_session', pattern: /_rails_session/i, confidence: 90 },
    ],
  },
  {
    name: 'Next.js',
    category: 'framework',
    patterns: [
      { source: 'header', key: 'x-powered-by', pattern: /Next\.js/i, confidence: 95 },
      { source: 'html', pattern: /_next\/static/i, confidence: 90 },
      { source: 'html', pattern: /__NEXT_DATA__/i, confidence: 95 },
      { source: 'script', pattern: /_next\/static\/chunks/i, confidence: 90 },
    ],
  },
  {
    name: 'Nuxt.js',
    category: 'framework',
    patterns: [
      { source: 'html', pattern: /__NUXT__/i, confidence: 95 },
      { source: 'html', pattern: /_nuxt\//i, confidence: 90 },
    ],
  },
  {
    name: 'Spring',
    category: 'framework',
    patterns: [
      { source: 'header', key: 'x-application-context', pattern: /.+/i, confidence: 80 },
      { source: 'html', pattern: /spring/i, confidence: 20 },
    ],
  },

  // ─── CMS ──────────────────────────────────────
  {
    name: 'WordPress',
    category: 'cms',
    patterns: [
      { source: 'meta', key: 'generator', pattern: /WordPress\s?(\d[\d.]*)?/i, versionGroup: 1, confidence: 95 },
      { source: 'html', pattern: /wp-content/i, confidence: 90 },
      { source: 'html', pattern: /wp-includes/i, confidence: 90 },
      { source: 'script', pattern: /wp-embed\.min\.js/i, confidence: 85 },
    ],
  },
  {
    name: 'Joomla',
    category: 'cms',
    patterns: [
      { source: 'meta', key: 'generator', pattern: /Joomla/i, confidence: 95 },
      { source: 'html', pattern: /\/media\/jui\//i, confidence: 85 },
      { source: 'html', pattern: /\/components\/com_/i, confidence: 75 },
    ],
  },
  {
    name: 'Drupal',
    category: 'cms',
    patterns: [
      { source: 'meta', key: 'generator', pattern: /Drupal\s?(\d[\d.]*)?/i, versionGroup: 1, confidence: 95 },
      { source: 'header', key: 'x-drupal-cache', pattern: /.+/i, confidence: 95 },
      { source: 'html', pattern: /sites\/default\/files/i, confidence: 80 },
      { source: 'html', pattern: /Drupal\.settings/i, confidence: 90 },
    ],
  },
  {
    name: 'Shopify',
    category: 'cms',
    patterns: [
      { source: 'header', key: 'x-shopid', pattern: /.+/i, confidence: 95 },
      { source: 'html', pattern: /cdn\.shopify\.com/i, confidence: 95 },
      { source: 'html', pattern: /Shopify\.theme/i, confidence: 90 },
    ],
  },

  // ─── JavaScript Libraries ────────────────────
  {
    name: 'React',
    category: 'js-library',
    patterns: [
      { source: 'html', pattern: /data-reactroot|data-reactid|__react/i, confidence: 90 },
      { source: 'html', pattern: /<div id=["'](?:root|app|__next)["']><\/div>/i, confidence: 40 },
      { source: 'script', pattern: /react(?:\.production|\.development)?\.min\.js/i, confidence: 95 },
    ],
  },
  {
    name: 'Vue.js',
    category: 'js-library',
    patterns: [
      { source: 'html', pattern: /data-v-[a-f0-9]+/i, confidence: 90 },
      { source: 'html', pattern: /id=["']app["'][^>]*>/i, confidence: 25 },
      { source: 'script', pattern: /vue(?:\.runtime)?(?:\.global)?(?:\.prod)?\.js/i, confidence: 95 },
    ],
  },
  {
    name: 'Angular',
    category: 'js-library',
    patterns: [
      { source: 'html', pattern: /ng-version=["'](\d[\d.]*)/i, versionGroup: 1, confidence: 95 },
      { source: 'html', pattern: /_ngcontent-/i, confidence: 90 },
      { source: 'script', pattern: /(?:runtime|polyfills|main)(?:\.[a-f0-9]+)?\.js/i, confidence: 40 },
    ],
  },
  {
    name: 'jQuery',
    category: 'js-library',
    patterns: [
      { source: 'script', pattern: /jquery[.-](\d[\d.]*)?(?:\.min)?\.js/i, versionGroup: 1, confidence: 95 },
      { source: 'html', pattern: /jquery/i, confidence: 30 },
    ],
  },

  // ─── CSS Frameworks ───────────────────────────
  {
    name: 'Bootstrap',
    category: 'css-framework',
    patterns: [
      { source: 'html', pattern: /bootstrap(?:\.min)?\.css/i, confidence: 95 },
      { source: 'html', pattern: /class=["'][^"']*\b(?:container-fluid|navbar-toggler|btn-primary)\b/i, confidence: 60 },
    ],
  },
  {
    name: 'Tailwind CSS',
    category: 'css-framework',
    patterns: [
      { source: 'html', pattern: /class=["'][^"']*\b(?:flex|grid|bg-|text-|p-|m-|rounded-|shadow-)\b/i, confidence: 50 },
      { source: 'html', pattern: /tailwind/i, confidence: 80 },
    ],
  },

  // ─── WAF / CDN ────────────────────────────────
  {
    name: 'Cloudflare',
    category: 'waf',
    patterns: [
      { source: 'header', key: 'cf-ray', pattern: /.+/i, confidence: 99 },
      { source: 'header', key: 'server', pattern: /cloudflare/i, confidence: 99 },
      { source: 'header', key: 'cf-cache-status', pattern: /.+/i, confidence: 95 },
    ],
  },
  {
    name: 'AWS CloudFront',
    category: 'cdn',
    patterns: [
      { source: 'header', key: 'x-amz-cf-id', pattern: /.+/i, confidence: 95 },
      { source: 'header', key: 'x-amz-cf-pop', pattern: /.+/i, confidence: 95 },
      { source: 'header', key: 'via', pattern: /CloudFront/i, confidence: 90 },
    ],
  },
  {
    name: 'Akamai',
    category: 'waf',
    patterns: [
      { source: 'header', key: 'x-akamai-transformed', pattern: /.+/i, confidence: 95 },
      { source: 'header', key: 'server', pattern: /AkamaiNetStorage|AkamaiGHost/i, confidence: 95 },
    ],
  },
  {
    name: 'Sucuri',
    category: 'waf',
    patterns: [
      { source: 'header', key: 'x-sucuri-id', pattern: /.+/i, confidence: 99 },
      { source: 'header', key: 'server', pattern: /Sucuri/i, confidence: 95 },
    ],
  },
  {
    name: 'Vercel',
    category: 'cdn',
    patterns: [
      { source: 'header', key: 'x-vercel-id', pattern: /.+/i, confidence: 95 },
      { source: 'header', key: 'server', pattern: /Vercel/i, confidence: 95 },
    ],
  },
  {
    name: 'Netlify',
    category: 'cdn',
    patterns: [
      { source: 'header', key: 'x-nf-request-id', pattern: /.+/i, confidence: 95 },
      { source: 'header', key: 'server', pattern: /Netlify/i, confidence: 95 },
    ],
  },

  // ─── Analytics ────────────────────────────────
  {
    name: 'Google Analytics',
    category: 'analytics',
    patterns: [
      { source: 'script', pattern: /google-analytics\.com\/analytics\.js/i, confidence: 95 },
      { source: 'script', pattern: /googletagmanager\.com\/gtag/i, confidence: 95 },
      { source: 'html', pattern: /UA-\d{4,}-\d{1,}/i, confidence: 90 },
      { source: 'html', pattern: /G-[A-Z0-9]+/i, confidence: 70 },
    ],
  },

  // ─── Operating Systems ────────────────────────
  {
    name: 'Ubuntu',
    category: 'os',
    patterns: [
      { source: 'header', key: 'server', pattern: /Ubuntu/i, confidence: 85 },
    ],
  },
  {
    name: 'Debian',
    category: 'os',
    patterns: [
      { source: 'header', key: 'server', pattern: /Debian/i, confidence: 85 },
    ],
  },
  {
    name: 'CentOS',
    category: 'os',
    patterns: [
      { source: 'header', key: 'server', pattern: /CentOS/i, confidence: 85 },
    ],
  },
  {
    name: 'Windows Server',
    category: 'os',
    patterns: [
      { source: 'header', key: 'server', pattern: /Win(?:dows|32|64)/i, confidence: 80 },
      { source: 'header', key: 'server', pattern: /Microsoft-IIS/i, confidence: 70 },
    ],
  },
];
