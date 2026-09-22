export const APP_NAME = 'WebSec Auditor';
export const APP_VERSION = '0.1.0';

export const SCAN_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type ScanStatus = (typeof SCAN_STATUS)[keyof typeof SCAN_STATUS];

export const MODULE_NAMES = {
  PROFILER: 'profiler',
  VULN_SCANNER: 'vuln-scanner',
  EXPLOIT_SIM: 'exploit-sim',
  STRESS_TESTER: 'stress-tester',
} as const;

export type ModuleName = (typeof MODULE_NAMES)[keyof typeof MODULE_NAMES];

export const SEVERITY = {
  INFO: 'info',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type Severity = (typeof SEVERITY)[keyof typeof SEVERITY];

export const HTTP_TIMEOUT_MS = 15_000;
export const MAX_REDIRECTS = 5;
export const DEFAULT_USER_AGENT = `${APP_NAME}/${APP_VERSION} (Security Auditor)`;
