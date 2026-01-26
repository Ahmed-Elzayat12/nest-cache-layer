import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import {
  CacheBucket,
  CACHE_MODULE_OPTIONS,
  CacheModuleOptions,
} from './cache.constants';

@Injectable()
export class AppCacheService {
  private readonly logger = new Logger(AppCacheService.name);
  private readonly versionPrefix = 'cache:version';
  private readonly keyPrefix = 'cache';

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @Optional()
    @Inject(CACHE_MODULE_OPTIONS)
    private readonly options?: CacheModuleOptions,
  ) {}

  async getOrSet<T>(
    bucket: CacheBucket,
    suffix: string,
    ttlSeconds: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    let key: string | undefined;

    try {
      key = await this.buildKey(bucket, suffix);
      const cached = await this.cache.get<T>(key);

      if (cached !== undefined && cached !== null) {
        this.options?.metrics?.recordCacheHit(bucket);
        return cached;
      }

      this.options?.metrics?.recordCacheMiss(bucket);
    } catch (error) {
      this.logger.warn(
        `Cache read failed for bucket ${bucket}, falling back to source`,
      );
    }

    try {
      if (!key) {
        return await loader();
      }

      const ttlMs = ttlSeconds * 1000;
      const wrapper = this.cache as Cache & {
        wrap: <TValue>(
          key: string,
          fn: () => Promise<TValue>,
          ttl?: number,
        ) => Promise<TValue>;
      };

      return await wrapper.wrap(key, loader, ttlMs);
    } catch (error) {
      this.logger.warn(`Cache write failed for bucket ${bucket}`);
    }

    return loader();
  }

  async bumpBucket(bucket: CacheBucket): Promise<void> {
    const versionKey = this.getVersionKey(bucket);
    const version = `${Date.now()}`;
    try {
      await this.cache.set(versionKey, version, 0);
      this.logger.debug(`Cache invalidated for bucket: ${bucket}`);
    } catch (error) {
      this.logger.warn(`Cache invalidation failed for bucket: ${bucket}`);
    }
  }

  async bumpBuckets(buckets: CacheBucket[]): Promise<void> {
    await Promise.all(buckets.map((bucket) => this.bumpBucket(bucket)));
  }

  private getVersionKey(bucket: CacheBucket): string {
    return `${this.versionPrefix}:${bucket}`;
  }

  private async getBucketVersion(bucket: CacheBucket): Promise<string> {
    const versionKey = this.getVersionKey(bucket);
    try {
      const existing = await this.cache.get<string | number>(versionKey);

      if (existing) {
        return String(existing);
      }

      const version = `${Date.now()}`;
      await this.cache.set(versionKey, version, 0);
      return version;
    } catch (error) {
      return `${Date.now()}`;
    }
  }

  private async buildKey(bucket: CacheBucket, suffix: string): Promise<string> {
    const version = await this.getBucketVersion(bucket);
    return `${this.keyPrefix}:${bucket}:v${version}:${suffix}`;
  }
}
