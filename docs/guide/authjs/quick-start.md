---
title: Quick Start
group: Auth.js Provider
children:
  - ./qwik-auth-handler.md
  - ./session-data.md
  - ./custom-pages.md
  - ./server-side/session-access.md
  - ./server-side/rest-api.md
---

# Auth.js Quick Start

This guide walks through setting up `@zitadel/qwik-auth` with the Auth.js
provider, suitable for OAuth, magic links, and credentials sign-in.

## Installation

Install `@auth/core` alongside `@zitadel/qwik-auth`:

```bash
npm install @zitadel/qwik-auth @auth/core
```

## Configure QwikAuth

Create `src/routes/plugin@auth.ts` and call the `QwikAuth$()` factory. The
plugin name (`plugin@auth.ts`) ensures Qwik runs it on every request:

```ts
// src/routes/plugin@auth.ts
import { QwikAuth$ } from '@zitadel/qwik-auth';
import GitHub from '@auth/core/providers/github';

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  ({ env }) => ({
    secret: env.get('AUTH_SECRET'),
    providers: [
      GitHub({
        clientId: env.get('GITHUB_ID'),
        clientSecret: env.get('GITHUB_SECRET'),
      }),
    ],
  }),
);
```

The plugin auto-mounts the Auth.js REST endpoints under `/api/auth/*` and
exposes `useSession` / `useSignIn$` / `useSignOut$` to your routes.

## Set the secret

The `secret` is used to sign + encrypt session JWTs. In production this MUST
be set:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set it as `AUTH_SECRET` in your environment.

## Next Steps

- [Customize session data](./session-data.md)
- [Override the default auth pages](./custom-pages.md)
- [Access the session server-side](./server-side/session-access.md)
