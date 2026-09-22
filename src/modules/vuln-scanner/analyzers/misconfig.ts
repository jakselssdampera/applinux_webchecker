import { httpRequest } from '../../../core/http-client.js';
import type { Vulnerability } from '../types.js';

const SENSITIVE_FILES = [
  '/.env',
  '/.git/config',
  '/backup.zip',
  '/.DS_Store',
  '/config.php',
  '/wp-config.php.bak'
];

export async function analyzeMisconfig(targetUrl: string): Promise<Vulnerability[]> {
  const vulns: Vulnerability[] = [];
  const baseUrl = new URL(targetUrl).origin;

  // 1. Check for exposed sensitive files
  for (const file of SENSITIVE_FILES) {
    try {
      const testUrl = `${baseUrl}${file}`;
      const response = await httpRequest(testUrl, { method: 'GET' });
      
      if (response.statusCode === 200) {
        const text = response.body;
        
        // Basic check if it's not just a custom 404 page returning 200
        if (
          text.includes('DB_PASSWORD') || 
          text.includes('core]') || 
          text.includes('<?php')
        ) {
          vulns.push({
            id: 'MISCONF_SENSITIVE_FILE',
            title: 'Exposed Sensitive File',
            description: `The file ${file} is accessible and may contain sensitive information.`,
            severity: 'high',
            url: testUrl,
            evidence: `Status 200, Content matched sensitive signatures`,
            remediation: 'Restrict access to dotfiles and backup files via web server configuration.'
          });
        }
      }
    } catch {
      // Ignore network errors
    }
  }

  // 2. Check Directory Listing
  try {
    const testDir = `${baseUrl}/images/`; // Common directory
    const response = await httpRequest(testDir, { method: 'GET' });
    if (response.statusCode === 200) {
      const text = response.body;
      if (text.includes('Index of /') || text.includes('Directory listing for')) {
        vulns.push({
          id: 'MISCONF_DIR_LISTING',
          title: 'Directory Listing Enabled',
          description: 'The web server allows listing the contents of directories.',
          severity: 'low',
          url: testDir,
          evidence: `Status 200, Found "Index of /" in response`,
          remediation: 'Disable directory listing in your web server configuration (e.g., Options -Indexes in Apache).'
        });
      }
    }
  } catch {
    // Ignore
  }

  return vulns;
}
