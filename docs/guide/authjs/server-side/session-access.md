---
title: Session Access
group: Auth.js Provider
category: Server Side
---

# Server-side session access

The Qwik plugin (`routes/plugin@auth.ts`) populates `event.sharedMap` with
the current session on every request. Access it from any request handler,
`routeLoader$`, or `routeAction$`:

## In a routeLoader$

```ts
// src/routes/profile/index.tsx
import { routeLoader$ } from '@builder.io/qwik-city';

export const useProfile = routeLoader$(async (event) => {
  const session = event.sharedMap.get('session');
  if (!session) throw event.redirect(302, '/auth/login');
  return { user: session.user };
});
```

## In an onRequest handler

```ts
// src/routes/api/me/index.ts
import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async (event) => {
  const session = event.sharedMap.get('session');
  if (!session) {
    event.json(401, { error: 'unauthorised' });
    return;
  }
  event.json(200, { user: session.user });
};
```

## Return shape

The session is the object Auth.js builds in the `session` callback, or
`undefined` when no valid session exists.
