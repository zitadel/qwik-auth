---
title: Custom Pages
group: Auth.js Provider
---

# Custom auth pages

Point `pages.signIn` and `pages.error` at your custom routes:

## Config

```ts
// src/routes/plugin@auth.ts
QwikAuth$(({ env }) => ({
  // ...
  pages: { signIn: '/auth/login', error: '/auth/error' },
}));
```

## Custom sign-in page

```tsx
// src/routes/auth/login/index.tsx
import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export default component$(() => {
  const csrfToken = useSignal('');
  useVisibleTask$(async () => {
    const r = await fetch('/api/auth/csrf');
    csrfToken.value = (await r.json()).csrfToken;
  });
  return (
    <form action="/api/auth/signin/github" method="post">
      <input type="hidden" name="csrfToken" value={csrfToken.value} />
      <button type="submit">Sign in with GitHub</button>
    </form>
  );
});
```

## Custom error page

```tsx
// src/routes/auth/error/index.tsx
import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';

export default component$(() => {
  const loc = useLocation();
  const error = loc.url.searchParams.get('error') ?? 'default';
  return <main><h1>Sign-in error</h1><p>Code: {error}</p></main>;
});
```
