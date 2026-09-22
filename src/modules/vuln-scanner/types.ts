export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface Vulnerability {
  id: string; // e.g., 'SQLI_01'
  title: string;
  description: string;
  severity: Severity;
  url: string;
  parameter?: string;
  evidence: string;
  remediation: string;
}

export interface VulnScannerResult {
  targetUrl: string;
  vulnerabilities: Vulnerability[];
  crawledUrls: string[];
  scannedAt: string;
}
