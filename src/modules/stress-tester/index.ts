import { request } from 'undici';
import { DEFAULT_USER_AGENT } from '../../utils/constants.js';
import type { StressTesterConfig, StressTesterResult } from './types.js';

export class StressTesterModule {
  public async run(config: StressTesterConfig): Promise<StressTesterResult> {
    const { targetUrl, targetIp, durationMs = 15000, concurrency = 50, method = 'GET' } = config;

    // Use dispatcher with appropriate localAddress if IP is forced,
    // but undici global dispatcher doesn't easily map hostname to specific IP per request
    // without a custom connector. For simplicity in this module, we will just use the URL
    // and rely on system DNS, unless we want to implement a custom Agent.
    // For now, we will just hit the targetUrl.

    const startTime = Date.now();
    const endTime = startTime + durationMs;

    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    let totalErrors = 0;
    
    let minLatency = Number.MAX_SAFE_INTEGER;
    let maxLatency = 0;
    let totalLatency = 0;

    const errorDistribution: Record<string, number> = {};

    let isRunning = true;

    // Helper to run a single request loop on one "thread"/worker
    const worker = async () => {
      while (isRunning && Date.now() < endTime) {
        totalRequests++;
        const reqStart = Date.now();
        try {
          const { statusCode, body } = await request(targetUrl, {
            method,
            headers: {
              'User-Agent': DEFAULT_USER_AGENT,
              'Connection': 'keep-alive',
            },
            throwOnError: false, // We want to count 4xx and 5xx as responses
          });
          
          // Must consume body to free the socket
          await body.dump();

          const latency = Date.now() - reqStart;
          totalLatency += latency;
          if (latency < minLatency) minLatency = latency;
          if (latency > maxLatency) maxLatency = latency;

          if (statusCode >= 200 && statusCode < 400) {
            successfulRequests++;
          } else {
            failedRequests++;
            const errKey = `HTTP_${statusCode}`;
            errorDistribution[errKey] = (errorDistribution[errKey] || 0) + 1;
          }
        } catch (err) {
          totalErrors++;
          const errCode = (err as any).code || err.name || 'UNKNOWN_ERROR';
          errorDistribution[errCode] = (errorDistribution[errCode] || 0) + 1;
        }
      }
    };

    // Spawn workers
    const workers = [];
    for (let i = 0; i < concurrency; i++) {
      workers.push(worker());
    }

    // Wait for duration to finish
    await Promise.all(workers);
    isRunning = false;

    const actualDuration = Date.now() - startTime;
    const requestsPerSecond = totalRequests > 0 ? (totalRequests / actualDuration) * 1000 : 0;
    const avgLatency = totalRequests - totalErrors > 0 ? totalLatency / (totalRequests - totalErrors) : 0;

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      totalErrors,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
      latency: {
        min: minLatency === Number.MAX_SAFE_INTEGER ? 0 : minLatency,
        max: maxLatency,
        avg: Math.round(avgLatency),
      },
      errorDistribution,
      durationMs: actualDuration,
    };
  }
}
