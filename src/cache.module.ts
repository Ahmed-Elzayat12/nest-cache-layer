import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import {
  CACHE_MODULE_OPTIONS,
  CacheModuleOptions,
} from './cache.constants';
import { AppCacheService } from './cache.service';

@Global()
@Module({})
export class AppCacheModule {
  static forRoot(options: CacheModuleOptions = {}): any {
    return {
      module: AppCacheModule,
      imports: [
        CacheModule.registerAsync({
          useFactory: async () => {
            const ttlSeconds = options.defaultTtlSeconds ?? 60;
            const ttl = ttlSeconds * 1000;

            if (!options.redisUrl) {
              return {
                ttl,
              };
            }

            return {
              ttl,
              store: await redisStore({
                url: options.redisUrl,
                keyPrefix: options.keyPrefix,
              }),
            };
          },
        }),
      ],
      providers: [
        AppCacheService,
        {
          provide: CACHE_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [AppCacheService],
    };
  }
}
