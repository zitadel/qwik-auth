import { Auth, setEnvDefaults, createActionURL } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { routeAction$, routeLoader$ } from '@builder.io/qwik-city';
import type { RequestEventCommon } from '@builder.io/qwik-city';
import type { Session } from '@auth/core/types';

// noinspection JSUnusedGlobalSymbols

const config = {
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
};

setEnvDefaults(process.env, config);

const basePath = config.basePath.replace(/\/$/, '');

async function fetchSession(
  event: RequestEventCommon,
): Promise<Session | null> {
  const url = createActionURL(
    'session',
    event.url.protocol.slice(0, -1) as 'http' | 'https',
    new Headers(event.request.headers),
    process.env,
    config,
  );
  const response = await Auth(
    new Request(url, {
      headers: { cookie: event.request.headers.get('cookie') ?? '' },
    }),
    config,
  );
  const data = (await response.json()) as Record<string, unknown> | null;
  if (!data || !Object.keys(data).length) return null;
  if (response.status === 200) return data as unknown as Session;
  return null;
}

/**
 * Global auth middleware.
 * - For /api/auth/* paths: delegates to Auth.js handler.
 * - For all other paths: pre-loads the session into sharedMap so route
 *   onRequest handlers (e.g. /profile) and routeLoaders can read it.
 */
export async function onRequest(event: RequestEventCommon) {
  const { url, request } = event;

  const isAuthEndpoint =
    url.pathname.startsWith(basePath + '/') &&
    !url.pathname.startsWith(basePath + '/logout');
  if (isAuthEndpoint) {
    throw event.send(await Auth(request, config));
  }

  const session = await fetchSession(event);
  event.sharedMap.set('session', session);
}

export const useSession = routeLoader$<Session | null>(async (event) => {
  return (event.sharedMap.get('session') as Session | null) ?? null;
});

export const useSignIn = routeAction$(async (data, event) => {
  const providerId = data.providerId as string | undefined;
  const options = data.options as { redirectTo?: string } | undefined;
  const params = new URLSearchParams();
  if (options?.redirectTo) params.set('callbackUrl', options.redirectTo);
  const paramStr = params.toString();
  const path = providerId
    ? `${basePath}/signin/${providerId}${paramStr ? `?${paramStr}` : ''}`
    : `${basePath}/signin${paramStr ? `?${paramStr}` : ''}`;
  throw event.redirect(302, path);
});

export const useSignOut = routeAction$(async (_data, event) => {
  throw event.redirect(302, `${basePath}/signout`);
});
