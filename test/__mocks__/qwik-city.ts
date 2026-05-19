// Jest stub for `@builder.io/qwik-city` — provides minimal surface so the
// SDK can be imported and the returned shape inspected without running
// the actual Qwik runtime.
export type RequestEventCommon = {
  request: Request;
  url: URL;
  env: { get(key: string): string | undefined };
  send(statusCode: number, body: string): void;
  redirect(statusCode: number, url: string): never;
  headers: Headers;
  sharedMap: Map<string, unknown>;
};

export function globalAction$<T extends (...args: unknown[]) => unknown>(
  handler: T,
): T {
  return handler;
}

export function routeLoader$<T extends (...args: unknown[]) => unknown>(
  fn: T,
): T {
  return fn;
}

export function zod$(schema: unknown): unknown {
  return schema;
}

export const z = {
  string: () => ({ optional: () => ({}) }),
  object: () => ({
    passthrough: () => ({ partial: () => ({ optional: () => ({}) }) }),
  }),
};
