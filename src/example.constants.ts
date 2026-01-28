export const ExampleCacheBuckets = {
  GREETING: 'example-greeting',
} as const;

export type ExampleCacheBucket =
  (typeof ExampleCacheBuckets)[keyof typeof ExampleCacheBuckets];

export const ExampleCacheTtlSeconds = {
  GREETING: 30,
} as const;
