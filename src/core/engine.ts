import { EventEmitter } from 'node:events';
import { nanoid } from 'nanoid';
import { ProfilerModule } from '../modules/profiler/index.js';
import { VulnScannerModule } from '../modules/vuln-scanner/index.js';
import { StressTesterModule } from '../modules/stress-tester/index.js';
import { auditLogger } from './audit-logger.js';
import { encrypt } from '../utils/crypto.js';
import { config } from '../config.js';
import {
  insertScan,
  updateScanStatus,
  insertScanResult,
} from './database.js';
import { SCAN_STATUS, MODULE_NAMES, type ModuleName } from '../utils/constants.js';

export interface ScanRequest {
  targetUrl: string;
  targetIp: string | null;
  modules: ModuleName[];
}

export interface ScanEvent {
  scanId: string;
  type: 'start' | 'progress' | 'module-complete' | 'done' | 'error';
  module?: string;
  message: string;
  data?: unknown;
  progress?: number; // 0-100
}

/**
 * Core Scan Engine — orchestrates all scanning modules.
 * Emits events for real-time progress via WebSocket.
 */
export class ScanEngine extends EventEmitter {
  private profiler = new ProfilerModule();
  private vulnScanner = new VulnScannerModule();
  private stressTester = new StressTesterModule();

  /**
   * Start a scan against the target URL.
   * Runs asynchronously and emits progress events.
   */
  async startScan(request: ScanRequest): Promise<string> {
    const scanId = nanoid(12);
    const { targetUrl, targetIp, modules } = request;

    // Insert scan record
    insertScan({
      id: scanId,
      targetUrl,
      targetIp,
      modules,
    });

    // Log to audit
    auditLogger.logScanStart(scanId, targetUrl, targetIp, modules);

    // Update status to running
    updateScanStatus(scanId, SCAN_STATUS.RUNNING);

    this.emitEvent({
      scanId,
      type: 'start',
      message: `Scan started for ${targetUrl}`,
      progress: 0,
    });

    // Run scan asynchronously
    this.executeScan(scanId, request).catch((err) => {
      const errorMessage = err instanceof Error ? err.message : String(err);
      updateScanStatus(scanId, SCAN_STATUS.FAILED, errorMessage);
      this.emitEvent({
        scanId,
        type: 'error',
        message: `Scan failed: ${errorMessage}`,
      });
      auditLogger.logScanComplete(scanId, targetUrl, 'failed');
    });

    return scanId;
  }

  private async executeScan(scanId: string, request: ScanRequest): Promise<void> {
    const { targetUrl, targetIp, modules } = request;
    const totalModules = modules.length;
    let completedModules = 0;

    for (const moduleName of modules) {
      try {
        this.emitEvent({
          scanId,
          type: 'progress',
          module: moduleName,
          message: `Running module: ${moduleName}`,
          progress: Math.round((completedModules / totalModules) * 100),
        });

        let result: unknown;

        switch (moduleName) {
          case MODULE_NAMES.PROFILER:
            result = await this.profiler.run(targetUrl, targetIp);
            break;

          case MODULE_NAMES.VULN_SCANNER:
            result = await this.vulnScanner.run(targetUrl, targetIp);
            break;

          case MODULE_NAMES.STRESS_TESTER:
            result = await this.stressTester.run({
              targetUrl,
              targetIp,
            });
            break;

          case MODULE_NAMES.EXPLOIT_SIM:
            // Placeholder for future modules
            result = { message: `Module ${moduleName} not yet implemented` };
            break;

          default:
            result = { message: `Unknown module: ${moduleName}` };
        }

        // Encrypt and store result
        const resultData = JSON.stringify(result);
        const encryptedData = config.encryptionKey
          ? encrypt(resultData, config.encryptionKey)
          : resultData;

        insertScanResult({
          id: nanoid(12),
          scanId,
          module: moduleName,
          data: encryptedData,
        });

        completedModules++;

        this.emitEvent({
          scanId,
          type: 'module-complete',
          module: moduleName,
          message: `Module ${moduleName} completed`,
          data: result, // Send unencrypted to WebSocket for live display
          progress: Math.round((completedModules / totalModules) * 100),
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        completedModules++;
        this.emitEvent({
          scanId,
          type: 'progress',
          module: moduleName,
          message: `Module ${moduleName} failed: ${errorMessage}`,
          progress: Math.round((completedModules / totalModules) * 100),
        });
      }
    }

    // Mark scan as completed
    updateScanStatus(scanId, SCAN_STATUS.COMPLETED);

    this.emitEvent({
      scanId,
      type: 'done',
      message: 'Scan completed successfully',
      progress: 100,
    });

    auditLogger.logScanComplete(scanId, targetUrl, 'completed');
  }

  private emitEvent(event: ScanEvent): void {
    this.emit('scan-event', event);
  }
}

// Singleton engine
export const scanEngine = new ScanEngine();
