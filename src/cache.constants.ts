export interface CacheMetrics {
  recordCacheHit(bucket: string): void;
  recordCacheMiss(bucket: string): void;
}

export const CACHE_MODULE_OPTIONS = 'CACHE_MODULE_OPTIONS';

export interface CacheModuleOptions {
  redisUrl?: string;
  defaultTtlSeconds?: number;
  keyPrefix?: string;
  metrics?: CacheMetrics;
}

export type CacheBucket = string;

export type CacheTtlMap = Record<CacheBucket, number>;
