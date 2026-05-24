---
title: Installation
group: Getting Started
---

# Installation

Install `@zitadel/qwik-auth` and `@auth/core`:

```bash
# npm
npm install @zitadel/qwik-auth @auth/core

# pnpm
pnpm add @zitadel/qwik-auth @auth/core

# yarn
yarn add @zitadel/qwik-auth @auth/core
```

Register the auth plugin at `src/routes/plugin@auth.ts`:

```ts
// src/routes/plugin@auth.ts
import { QwikAuth$ } from '@zitadel/qwik-auth';

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  () => ({
    secret: import.meta.env.AUTH_SECRET,
    providers: [],
  }),
);
```
