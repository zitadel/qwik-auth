import {
  Auth,
  type AuthConfig,
  setEnvDefaults,
  createActionURL,
} from '@auth/core';
import type { Session } from '@auth/core/types';

export { AuthError, CredentialsSignin } from '@auth/core/errors';
export type {
  Account,
  DefaultSession,
  Profile,
  Session,
  User,
} from '@auth/core/types';

/**
 * Qwik City RequestEventCommon-compatible type.
 *
 * @public
 */
export type RequestEventCommon = {
  request: Request;
  url: URL;
  env: {
    get(key: string): string | undefined;
  };
  send(statusCode: number, body: string): void;
  redirect(statusCode: number, url: string): never;
  headers: Headers;
};

/**
 * Auth.js configuration for Qwik applications.
 *
 * @public
 */
export type QwikAuthConfig = Omit<AuthConfig, 'raw'>;

/**
 * Either a static {@link QwikAuthConfig} object or a request-scoped factory
 * `(event) => QwikAuthConfig`.
 *
 * The factory form defers config evaluation until request time. In Qwik this
 * is the critical pattern that keeps server-only imports (e.g. `@auth/core`
 * → `@panva/hkdf` → `node:crypto`) out of the client bundle: because
 * `plugin@auth.ts` is loaded by both the client and server entries, an
 * eagerly-evaluated config pulls every transitive import into the client
 * graph. The factory body is evaluated only at request time on the server,
 * so the heavy import subgraph stays server-only.
 *
 * @public
 */
export type QwikAuthConfigOrFactory =
  | QwikAuthConfig
  | ((event: RequestEventCommon) => QwikAuthConfig);

/**
 * Retrieves the current session on the server side.
 *
 * @param request - The current request object
 * @param config - Auth.js configuration
 * @returns The session object or null
 *
 * @example
 * ```ts
 * import { getSession } from '@zitadel/qwik-auth';
 * import { authOptions } from '~/lib/auth';
 *
 * const session = await getSession(request, authOptions);
 * ```
 *
 * @public
 */
export async function getSession(
  request: Request,
  config: QwikAuthConfig,
): Promise<Session | null> {
  config.basePath ??= '/api/auth';
  setEnvDefaults(process.env, config);

  const url = createActionURL(
    'session',
    new URL(request.url).protocol.slice(0, -1) as 'http' | 'https',
    new Headers(request.headers),
    process.env,
    config,
  );

  const response = await Auth(
    new Request(url, {
      headers: { cookie: request.headers.get('cookie') ?? '' },
    }),
    config,
  );

  const { status } = response;
  const data = (await response.json()) as Record<string, unknown> | null;
  if (!data || !Object.keys(data).length) return null;
  if (status === 200) return data as unknown as Session;
  throw new Error((data as { message?: string }).message ?? 'Session error');
}

/**
 * Creates a QwikAuth handler set.
 *
 * Accepts either a {@link QwikAuthConfig} object or a request-scoped
 * factory `(event) => QwikAuthConfig`. The factory form is the canonical
 * Qwik pattern: it defers config evaluation to request time, which keeps
 * server-only imports (e.g. `@auth/core` → `@panva/hkdf` → `node:crypto`)
 * out of the client bundle.
 *
 * Returns `{ onRequest, useSession, useSignIn, useSignOut }` that should be
 * exported from your `plugin@auth.ts` route.
 *
 * @param rawConfig - Auth.js configuration object or factory function
 * @returns Object containing onRequest, useSession, useSignIn, and useSignOut
 *
 * @public
 *
 * @example
 * ```ts
 * // src/routes/plugin@auth.ts — factory form (recommended for Qwik)
 * import { QwikAuth$ } from '@zitadel/qwik-auth';
 * import { getAuthConfig } from '~/lib/auth';
 * import type { RequestEventCommon } from '@builder.io/qwik-city';
 *
 * export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
 *   (event: RequestEventCommon) => {
 *     const env = (key: string) => event.env.get(`VITE_${key}`);
 *     return { ...getAuthConfig(env), trustHost: true };
 *   },
 * );
 * ```
 *
 * @example
 * ```ts
 * // src/routes/plugin@auth.ts — object form (only safe when no
 * // server-only imports are reachable from `getAuthConfig`)
 * import { QwikAuth$ } from '@zitadel/qwik-auth';
 * import { getAuthConfig } from '~/lib/auth';
 *
 * export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
 *   getAuthConfig((key) => process.env[key]),
 * );
 * ```
 */
export function QwikAuth$(rawConfig: QwikAuthConfigOrFactory): {
  onRequest: (event: RequestEventCommon) => Promise<void>;
  useSession: (event: RequestEventCommon) => Promise<Session | null>;
  useSignIn: (
    provider?: string,
    options?: { redirectTo?: string },
  ) => Promise<void>;
  useSignOut: (options?: { redirectTo?: string }) => Promise<void>;
} {
  function resolveConfig(event: RequestEventCommon): QwikAuthConfig {
    const c = typeof rawConfig === 'function' ? rawConfig(event) : rawConfig;
    c.basePath ??= '/api/auth';
    setEnvDefaults(process.env, c);
    return c;
  }

  function defaultBasePath(): string {
    if (typeof rawConfig === 'function') return '/api/auth';
    return (rawConfig.basePath ?? '/api/auth').replace(/\/$/, '');
  }

  async function onRequest(event: RequestEventCommon): Promise<void> {
    const config = resolveConfig(event);
    const basePath = (config.basePath ?? '/api/auth').replace(/\/$/, '');
    if (!event.url.pathname.startsWith(basePath + '/')) {
      return;
    }
    const response = await Auth(event.request, config);
    event.send(response.status, await response.text());
  }

  async function useSession(
    event: RequestEventCommon,
  ): Promise<Session | null> {
    const config = resolveConfig(event);
    return getSession(event.request, config);
  }

  async function useSignIn(
    provider?: string,
    options: { redirectTo?: string } = {},
  ): Promise<void> {
    const basePath = defaultBasePath();
    const params = new URLSearchParams();
    if (options.redirectTo) {
      params.set('callbackUrl', options.redirectTo);
    }
    const paramStr = params.toString();
    const url = provider
      ? `${basePath}/signin/${provider}${paramStr ? `?${paramStr}` : ''}`
      : `${basePath}/signin${paramStr ? `?${paramStr}` : ''}`;
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  }

  async function useSignOut(
    options: { redirectTo?: string } = {},
  ): Promise<void> {
    const basePath = defaultBasePath();
    const params = new URLSearchParams();
    if (options.redirectTo) {
      params.set('callbackUrl', options.redirectTo);
    }
    const paramStr = params.toString();
    const url = `${basePath}/signout${paramStr ? `?${paramStr}` : ''}`;
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  }

  return {
    onRequest,
    useSession,
    useSignIn,
    useSignOut,
  };
}
