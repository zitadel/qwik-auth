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
 */
export type QwikAuthConfig = Omit<AuthConfig, 'raw'>;

/**
 * Retrieves the current session from the request.
 *
 * @param request - The current request object
 * @param config - Auth.js configuration
 * @returns The session object or null
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
 * Creates a QwikAuth handler set from a plain Auth.js config object.
 *
 * Returns `{ onRequest, useSession, useSignIn, useSignOut }` that should be
 * exported from your `plugin@auth.ts` route.
 *
 * @param config - Auth.js configuration object
 *
 * @example
 * ```ts
 * // src/routes/plugin@auth.ts
 * import { QwikAuth$ } from '@zitadel/qwik-auth';
 * import { getAuthConfig } from '~/lib/auth';
 *
 * export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
 *   getAuthConfig((key) => process.env[key])
 * );
 * ```
 */
export function QwikAuth$(config: QwikAuthConfig): {
  onRequest: (event: RequestEventCommon) => Promise<void>;
  useSession: (event: RequestEventCommon) => Promise<Session | null>;
  useSignIn: (
    provider?: string,
    options?: { redirectTo?: string },
  ) => Promise<void>;
  useSignOut: (options?: { redirectTo?: string }) => Promise<void>;
} {
  config.basePath ??= '/api/auth';
  setEnvDefaults(process.env, config);
  const basePath = config.basePath.replace(/\/$/, '');

  async function onRequest(event: RequestEventCommon): Promise<void> {
    if (!event.url.pathname.startsWith(basePath + '/')) {
      return;
    }
    const response = await Auth(event.request, config);
    event.send(response.status, await response.text());
  }

  async function useSession(
    event: RequestEventCommon,
  ): Promise<Session | null> {
    return getSession(event.request, config);
  }

  async function useSignIn(
    provider?: string,
    options: { redirectTo?: string } = {},
  ): Promise<void> {
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
