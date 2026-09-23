/**
 * Shared interface for scanner and auditor modules.
 */
export interface IModule<T = unknown> {
  name: string;
  run(targetUrl: string, targetIp: string | null): Promise<T>;
}

export interface ModuleExecutionResult<T = unknown> {
  module: string;
  data: T;
  executedAt: string;
  durationMs?: number;
}
