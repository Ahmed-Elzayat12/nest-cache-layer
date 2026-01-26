# nest-cache-layer

Redis-backed cache module for NestJS with versioned keys, optional metrics hooks, and cache.wrap to reduce stampedes.

## Install

```
npm i nest-cache-layer
```

## Usage

```ts
import { AppCacheModule } from "nest-cache-layer";

@Module({
	imports: [
		AppCacheModule.forRoot({
			redisUrl: process.env.REDIS_URL,
			defaultTtlSeconds: 60,
			keyPrefix: "reporting",
			metrics: {
				recordCacheHit: (bucket) => console.log("hit", bucket),
				recordCacheMiss: (bucket) => console.log("miss", bucket),
			},
		}),
	],
})
export class AppModule {}
```

## Example buckets/TTLs

```ts
export const MyCacheBuckets = {
	ORDERS_AGG: "orders-agg",
} as const;

export type MyCacheBucket =
	(typeof MyCacheBuckets)[keyof typeof MyCacheBuckets];

export const MyCacheTtlSeconds = {
	ORDERS_LIST: 30,
} as const;
```

## API

- `AppCacheService.getOrSet(bucket, suffix, ttlSeconds, loader)`
- `AppCacheService.bumpBucket(bucket)` / `bumpBuckets(buckets)`
- `CacheBucket` type and `CacheTtlMap` helper type are exported

## Notes

- TTLs are in seconds at the API level and converted to milliseconds internally.
- Invalidation uses versioned keys per bucket.

## License

MIT
