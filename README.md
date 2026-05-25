# Qwik Auth

A [Qwik City](https://qwik.dev/docs/qwikcity/) integration that provides seamless authentication with
multiple providers, session management, and Qwik City-native plugin patterns.

This integration brings the power and flexibility of OAuth to Qwik City
applications with full TypeScript support, SSR-friendly HTTP handling,
and Qwik City-native patterns including route plugins and server request events.

### Why?

Modern web applications require robust, secure, and flexible authentication
systems. Integrating OAuth and session management with Qwik Cityapplications requires careful consideration of
framework patterns, server-side rendering, and TypeScript integration.

However, a direct integration isn't always straightforward. Different types
of applications or deployment scenarios might warrant different approaches:

- **Plugin Integration:** OAuth and auth flows operate at the HTTP level, while Qwik City
  uses route plugins (`plugin@*.ts`) and `RequestEventCommon` objects. A proper
  integration should bridge this gap by providing a plugin-compatible `onRequest`
  handler that intercepts auth routes transparently.
- **HTTP Request Handling:** Qwik City's route plugins receive `RequestEventCommon`
  objects with environment access via `event.env.get()`. This integration wires
  OAuth into the Qwik request lifecycle without manual response plumbing.
- **Session and Request Lifecycle:** Proper session handling in Qwik City
  requires SSR-friendly utilities compatible with Qwik's resumability model
  and server-side data loading patterns.
- **Route Protection:** Many applications need fine-grained authorization
  beyond simple authentication. `getSession()` provides a clean server-side
  primitive for protecting routes and accessing user data.

This integration, `@zitadel/qwik-auth`, aims to provide the flexibility to
handle such scenarios. It allows you to leverage the full OAuth provider ecosystem
while maintaining Qwik City best practices, ultimately leading to a more
effective and less burdensome authentication implementation.

## Installation

Install using NPM by using the following command:

```sh
npm install @zitadel/qwik-auth
```

## Usage

To use this integration, call `QwikAuth$()` with a plain OAuth config object
and export the resulting `onRequest`, `useSession`, `useSignIn`, and
`useSignOut` from a `plugin@auth.ts` route file.

Export the plugin handlers from `plugin@auth.ts`. `QwikAuth$` takes a
request-scoped factory `(event) => QwikAuthConfig` which the SDK wraps
in a QRL so server-only imports never enter the client bundle:

```ts
// src/routes/plugin@auth.ts
import { QwikAuth$ } from '@zitadel/qwik-auth';
import Zitadel from '@auth/core/providers/zitadel';

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  ({ env }) => ({
    providers: [
      Zitadel({
        clientId: env.get('ZITADEL_CLIENT_ID'),
        clientSecret: env.get('ZITADEL_CLIENT_SECRET'),
        issuer: env.get('ZITADEL_DOMAIN'),
      }),
    ],
    secret: env.get('AUTH_SECRET'),
    trustHost: true,
  }),
);
```

#### Using the Authentication System

The integration provides several functions and hooks for handling
authentication:

**Plugin Exports (from `plugin@auth.ts`):**

- `onRequest`: Route plugin handler that intercepts auth routes
- `useSession()`: Server-side session loader (returns `Session | null`)
- `useSignIn(provider?, options?)`: Initiates sign-in via redirect
- `useSignOut(options?)`: Initiates sign-out via redirect

**Standalone Server Utility:**

- `getSession(request, config)`: Retrieves the session directly from a request

**Basic Usage in a Route:**

```tsx
// src/routes/index.tsx
import { component$ } from '@builder.io/qwik';
import { useSession, useSignIn, useSignOut } from './plugin@auth';

export default component$(() => {
  const session = useSession();
  const signIn = useSignIn();
  const signOut = useSignOut();

  return (
    <div>
      {session.value ? (
        <>
          <p>Welcome, {session.value.user?.name}</p>
          <button onClick$={() => signOut()}>Sign out</button>
        </>
      ) : (
        <button onClick$={() => signIn('zitadel')}>Sign in</button>
      )}
    </div>
  );
});
```

Prefer direct session access in a server loader? Use `getSession()`:

```ts
// src/routes/profile/index.tsx
import { routeLoader$ } from '@builder.io/qwik-city';
import { getSession } from '@zitadel/qwik-auth';
import Zitadel from '@auth/core/providers/zitadel';

export const useProfileData = routeLoader$(async (event) => {
  const session = await getSession(event.request, {
    providers: [
      Zitadel({
        clientId: event.env.get('ZITADEL_CLIENT_ID'),
        clientSecret: event.env.get('ZITADEL_CLIENT_SECRET'),
        issuer: event.env.get('ZITADEL_DOMAIN'),
      }),
    ],
    secret: event.env.get('AUTH_SECRET'),
    trustHost: true,
  });
  if (!session) throw event.redirect(302, '/');
  return session;
});
```

##### Example: Advanced Configuration with Multiple Providers

This example shows how to use the integration with multiple OAuth
providers and custom session configuration:

```ts
// src/routes/plugin@auth.ts
import { QwikAuth$ } from '@zitadel/qwik-auth';
import Zitadel from '@auth/core/providers/zitadel';
import Google from '@auth/core/providers/google';

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  ({ env }) => ({
    providers: [
      Zitadel({
        clientId: env.get('ZITADEL_CLIENT_ID'),
        clientSecret: env.get('ZITADEL_CLIENT_SECRET'),
        issuer: env.get('ZITADEL_DOMAIN'),
      }),
      Google({
        clientId: env.get('GOOGLE_CLIENT_ID'),
        clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
      }),
    ],
    secret: env.get('AUTH_SECRET'),
    trustHost: true,
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) (token as any).roles = (user as any).roles;
        return token;
      },
      async session({ session, token }) {
        (session.user as any).roles = (token as any).roles as
          | string[]
          | undefined;
        return session;
      },
    },
  }),
);
```

## Known Issues

- **Plugin Route Required:** The integration must be wired in a Qwik City
  plugin route file (`src/routes/plugin@auth.ts`). The `plugin@` prefix is
  required for Qwik City to recognise it as a request plugin.
- **Environment Configuration:** The integration relies on `AUTH_SECRET` and,
  in many hosting scenarios, `AUTH_TRUST_HOST`. Ensure these are correctly set
  in your environment for production.
- **Callback URLs:** OAuth providers must be configured with the correct
  callback URL: `[origin]/api/auth/callback/[provider]`.
- **Type Augmentation:** If you attach additional properties (e.g., roles) to
  the user session object, extend your app's types accordingly so consumers of
  `session.user` remain type-safe.
- **Redirect Semantics:** OAuth providers expect real browser navigations during
  sign-in. The `useSignIn` and `useSignOut` helpers handle this for you — avoid
  manual `fetch()` calls to provider endpoints unless you know you need
  credential/email flows.

## Useful links

- **[Qwik City](https://qwik.dev/docs/qwikcity/):** The framework this
  integration targets.

## Contributing

If you have suggestions for how this integration could be improved, or
want to report a bug, open an issue — we'd love all and any contributions.

## License

Apache-2.0
