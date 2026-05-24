---
title: Session Access (client)
group: Application Side
---

# Client-side session access

The Qwik plugin (`routes/plugin@auth.ts`) exposes a `useSession`
`routeLoader$` you can call from any component:

## useSession

```tsx
// src/components/UserBadge.tsx
import { component$ } from '@builder.io/qwik';
import { useSession } from '~/routes/plugin@auth';

export const UserBadge = component$(() => {
  const session = useSession();
  return (
    <>
      {session.value ? (
        <span>Hello, {session.value.user?.name}</span>
      ) : (
        <a href="/auth/login">Sign in</a>
      )}
    </>
  );
});
```

## useSignIn$ / useSignOut$

```tsx
import { component$, $ } from '@builder.io/qwik';
import { useSignIn, useSignOut } from '~/routes/plugin@auth';

export const AuthButtons = component$(() => {
  const signIn = useSignIn();
  const signOut = useSignOut();
  return (
    <>
      <button onClick$={() => signIn.submit({ providerId: 'github' })}>
        Sign in with GitHub
      </button>
      <button onClick$={() => signOut.submit()}>Sign out</button>
    </>
  );
});
```
