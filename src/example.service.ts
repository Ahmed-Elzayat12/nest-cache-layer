import { Injectable } from '@nestjs/common';
import { AppCacheService } from './cache.service';
import {
  ExampleCacheBuckets,
  ExampleCacheTtlSeconds,
} from './example.constants';

@Injectable()
export class ExampleService {
  constructor(private readonly cache: AppCacheService) {}

  async getGreeting(name = 'world'): Promise<string> {
    return this.cache.getOrSet(
      ExampleCacheBuckets.GREETING,
      name,
      ExampleCacheTtlSeconds.GREETING,
      async () => `hello, ${name}`,
    );
  }

  async bumpGreetingCache(): Promise<void> {
    await this.cache.bumpBucket(ExampleCacheBuckets.GREETING);
  }
}
