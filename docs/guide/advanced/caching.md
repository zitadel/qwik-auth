---
title: Caching
group: Advanced
children:
  - ./url-resolutions.md
  - ./deployment/self-hosted.md
  - ./deployment/vercel.md
  - ./deployment/netlify.md
---

# Caching content

Hosting providers often offer caching at the edge. Most sites see big
speed wins (and cost savings) by taking advantage of it — no cold
start, no request processing, no JavaScript parsing, just HTML served
straight from a CDN.

By default the user's session is read in `useSession()` (a
`routeLoader$`) and rendered into the HTML. That's fine for
personalised pages, but it's a footgun the moment those pages are
cached: a cached response containing user A's session will be served
to user B.

To add caching in Qwik City, call `cacheControl()` from a
`RequestHandler`. See the
[Qwik City caching docs](https://qwik.dev/docs/caching/).

:::warning
If you cache a route, that route MUST NOT call `useSession()` or
render session data server-side. Otherwise the first user's session
leaks into the cached HTML served to everyone else.
:::

## Page specific cache rules

For a single cached route, export an `onGet` handler that calls
`cacheControl()`, and avoid touching the session server-side. Read the
session on the client instead.

```ts
// src/routes/index.tsx
import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    public: true,
    maxAge: 86400,
    sMaxAge: 86400,
  });
};

// Do not call useSession() in this route's loaders. Use a client-side
// component to read the session if you need it.
export default component$(() => <main>Public landing page</main>);
```

## Global cache rules

To cache most pages by default, call `cacheControl()` from the root
`onRequest` (alongside the auth plugin) and override it on routes
(like `/profile`) that must stay dynamic.

```ts
// src/routes/layout.tsx
import type { RequestHandler } from '@builder.io/qwik-city';

export const onRequest: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    public: true,
    maxAge: 86400,
    sMaxAge: 86400,
  });
};
```

## Combining rules

`cacheControl()` calls in a leaf route override calls made in a parent
layout. So you can flip the default per route.

For example: cache every page except `/profile`.

```ts
// src/routes/layout.tsx — global default: cached
export const onRequest: RequestHandler = async ({ cacheControl }) => {
  cacheControl({ public: true, maxAge: 86400, sMaxAge: 86400 });
};

// src/routes/profile/index.tsx — opt this route back into dynamic
export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({ private: true, noStore: true });
};

export const useProfile = routeLoader$(async (event) => {
  return await getSession(event);
});
```
