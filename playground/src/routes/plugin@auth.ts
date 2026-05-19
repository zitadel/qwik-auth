/**
 * Playground auth configuration. Wires `@zitadel/qwik-auth` into the
 * Qwik City request lifecycle by passing a request-scoped config
 * factory to `QwikAuth$`. The SDK QRL-wraps the factory body so the
 * Auth.js runtime (and its Node-only transitive deps) never enters
 * the client bundle.
 */
import { QwikAuth$ } from '@zitadel/qwik-auth';
import Credentials from '@auth/core/providers/credentials';

// noinspection JSUnusedGlobalSymbols
export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  () => ({
    basePath: '/api/auth',
    providers: [
      ...(process.env['OAUTH_ISSUER_URL']
        ? [
            {
              id: 'mock-oidc',
              name: 'Mock OIDC',
              type: 'oidc' as const,
              issuer: process.env['OAUTH_ISSUER_URL'],
              clientId: process.env['OAUTH_CLIENT_ID'] ?? 'test-client',
              clientSecret: process.env['OAUTH_CLIENT_SECRET'] ?? 'test-secret',
            },
          ]
        : []),
      Credentials({
        credentials: {
          username: { label: 'Username' },
          password: { label: 'Password', type: 'password' },
        },
        authorize(credentials) {
          if (
            credentials?.username === 'jsmith' &&
            credentials?.password === 'hunter2'
          ) {
            return { id: '1', name: 'J Smith', email: 'jsmith@example.com' };
          }
          return null;
        },
      }),
    ],
    session: { strategy: 'jwt' as const },
    secret: process.env['AUTH_SECRET']!,
    trustHost: true,
    callbacks: {
      redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
        try {
          const parsed = new URL(url, baseUrl);
          const base = new URL(baseUrl);
          if (parsed.origin !== base.origin) {
            return `${baseUrl}/profile`;
          }
          if (parsed.pathname === '/' && !parsed.search) {
            return `${baseUrl}/profile`;
          }
          return parsed.href;
        } catch {
          return `${baseUrl}/profile`;
        }
      },
    },
  }),
);
