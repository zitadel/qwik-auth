---
title: QwikAuth$ Factory
group: OAuth Provider
---

# QwikAuth$ Factory

The `QwikAuth$()` factory wires up the auth handler and returns Qwik
City actions/loaders bound to your config. Call it once in
`src/routes/plugin@auth.ts`:

```ts
import { QwikAuth$ } from '@zitadel/qwik-auth';

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  ({ env }) => ({
    secret: env.get('AUTH_SECRET'),
    providers: [/* ... */],
  }),
);
```

## Return values

| Key | Type | Use |
|---|---|---|
| `onRequest` | `RequestHandler` | Auto-runs on every request via the plugin |
| `useSession` | `routeLoader$` | Read the session in any component |
| `useSignIn`, `useSignOut` | `globalAction$` | Trigger sign-in / sign-out from a form |

Note: Qwik's QRL system means these are async-resolved. URL helpers
(`signInUrl`, `signOutUrl`) are also QRLs.

## Plugin name matters

The file MUST be named `plugin@auth.ts` (not `auth.ts`) so Qwik City
recognises it as a request plugin and runs `onRequest` on every request.

## Server-side reads

See [Server-side session access](./server-side/session-access.md).
