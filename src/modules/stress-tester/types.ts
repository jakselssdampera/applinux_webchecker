export interface StressTesterConfig {
  targetUrl: string;
  targetIp: string | null;
  durationMs?: number; // Default 10000 (10 seconds)
  concurrency?: number; // Default 50
  method?: 'GET' | 'POST';
}

export interface StressTesterResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalErrors: number;
  successRate: number; // 0-100%
  requestsPerSecond: number;
  latency: {
    min: number;
    max: number;
    avg: number;
  };
  errorDistribution: Record<string, number>; // e.g., { "502": 10, "ECONNRESET": 5 }
  durationMs: number;
}
