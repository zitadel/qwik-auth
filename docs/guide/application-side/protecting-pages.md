---
title: Protecting Pages
group: Application Side
---

# Protecting pages

Qwik gates routes via `onRequest` handlers (in `index.ts` files or in
`plugin@auth.ts`). The plugin already populates `event.sharedMap.get('session')`
on every request — your route just needs to redirect if it's absent.

## In a route onRequest

```ts
// src/routes/profile/index.tsx
import { component$ } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { useSession, signInUrl } from '~/routes/plugin@auth';

export const onRequest: RequestHandler = async (event) => {
  const session = event.sharedMap.get('session');
  if (!session) {
    throw event.redirect(
      302,
      await signInUrl(event, { redirectTo: event.url.pathname }),
    );
  }
};

export default component$(() => {
  const session = useSession();
  return <h1>Hello, {session.value?.user?.name}</h1>;
});
```

## In a layout onRequest (catch-all)

For an entire route prefix, gate from the layout's `onRequest`:

```ts
// src/routes/(protected)/layout.tsx
export const onRequest: RequestHandler = async (event) => {
  const session = event.sharedMap.get('session');
  if (!session) {
    throw event.redirect(302, '/auth/login');
  }
};
```

Any route under `(protected)/` inherits the gate.
