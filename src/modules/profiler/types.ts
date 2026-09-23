/**
 * Type definitions for the Technology Profiler module.
 */

/** Represents a detected technology with confidence score. */
export interface DetectedTechnology {
  name: string;
  category: TechCategory;
  version?: string;
  confidence: number; // 0-100
  evidence: string;   // What matched (header value, HTML pattern, etc.)
}

/** Technology categories. */
export type TechCategory =
  | 'web-server'
  | 'framework'
  | 'cms'
  | 'js-library'
  | 'css-framework'
  | 'language'
  | 'os'
  | 'waf'
  | 'cdn'
  | 'analytics'
  | 'other';

/** A signature pattern for technology detection. */
export interface TechSignature {
  name: string;
  category: TechCategory;
  patterns: SignaturePattern[];
}

/** Where and what to look for. */
export interface SignaturePattern {
  source: 'header' | 'html' | 'meta' | 'script' | 'cookie' | 'url';
  /** Header name, meta name, or other identifier */
  key?: string;
  /** Regex pattern to match against the value */
  pattern: RegExp;
  /** Version extraction group index (from regex capture) */
  versionGroup?: number;
  /** Confidence score if this pattern matches (0-100) */
  confidence: number;
}

/** Aggregated profiling result for a target. */
export interface ProfileResult {
  targetUrl: string;
  targetIp: string | null;
  technologies: DetectedTechnology[];
  headers: Record<string, string | string[] | undefined>;
  responseTime: number; // ms
  statusCode: number;
  redirectChain: string[];
  scannedAt: string;
}

export { type IModule } from '../../types/module.js';
