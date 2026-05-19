// Jest stub for `@builder.io/qwik` — provides minimal surface needed by
// the SDK at unit-test time. We pretend QRL is the identity type so the
// SDK's exported types resolve, and that `implicit$FirstArg` is just an
// identity wrapper so the `$`-suffixed export still behaves like a
// callable in tests.
export type QRL<T> = T;
export function implicit$FirstArg<T extends (arg: unknown) => unknown>(
  fn: T,
): T {
  return fn;
}
