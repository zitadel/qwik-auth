// Jest stub for `@builder.io/qwik/build` — exposes the compile-time
// constants the SDK reads. We set `isServer = true` so that the
// `if (isServer) { ... }` guards in the SDK still execute their bodies
// during unit tests.
export const isServer = true;
export const isBrowser = false;
export const isDev = false;
