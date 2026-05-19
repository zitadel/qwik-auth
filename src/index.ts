import {
  Auth,
  type AuthConfig,
  setEnvDefaults,
  createActionURL,
} from '@auth/core';
import type { Session } from '@auth/core/types';
import { isServer } from '@builder.io/qwik/build';
import { implicit$FirstArg, type QRL } from '@builder.io/qwik';
import {
  globalAction$,
  routeLoader$,
  z,
  zod$,
  type RequestEventCommon,
} from '@builder.io/qwik-city';

export { AuthError, CredentialsSignin } from '@auth/core/errors';
export type {
  Account,
  DefaultSession,
  Profile,
  Session,
  User,
} from '@auth/core/types';

export type { RequestEventCommon };

/**
 * Auth.js configuration for Qwik applications.
 *
 * @public
 */
export type QwikAuthConfig = Omit<AuthConfig, 'raw'>;

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
  if (!data || !Object.keys(data).length) {
    return null;
  }
  if (status === 200) {
    return data as unknown as Session;
  }
  throw new Error((data as { message?: string }).message ?? 'Session error');
}

/**
 * Internal factory consumed by {@link QwikAuth$}. Accepts a QRL so its
 * body stays server-only and Qwik's optimizer can drop `@auth/core`
 * from the client bundle.
 *
 * @internal
 */
export function QwikAuthQrl(
  authOptions: QRL<(event: RequestEventCommon) => QwikAuthConfig>,
) {
  const useSignIn = globalAction$(
    async ({ providerId, redirectTo, options }, req) => {
      if (!isServer) {
        return;
      }
      const config = await authOptions(req);
      config.basePath ??= '/api/auth';
      setEnvDefaults(process.env, config);
      const basePath = (config.basePath ?? '/api/auth').replace(/\/$/, '');
      const params = new URLSearchParams();
      const callback = options?.redirectTo ?? redirectTo;
      if (callback) {
        params.set('callbackUrl', callback);
      }
      const paramStr = params.toString();
      const url = providerId
        ? `${basePath}/signin/${providerId}${paramStr ? `?${paramStr}` : ''}`
        : `${basePath}/signin${paramStr ? `?${paramStr}` : ''}`;
      throw req.redirect(302, url);
    },
    zod$({
      providerId: z.string().optional(),
      redirectTo: z.string().optional(),
      options: z
        .object({ redirectTo: z.string() })
        .passthrough()
        .partial()
        .optional(),
    }),
  );

  const useSignOut = globalAction$(
    async ({ redirectTo }, req) => {
      if (!isServer) {
        return;
      }
      const config = await authOptions(req);
      config.basePath ??= '/api/auth';
      setEnvDefaults(process.env, config);
      const basePath = (config.basePath ?? '/api/auth').replace(/\/$/, '');
      const params = new URLSearchParams();
      if (redirectTo) {
        params.set('callbackUrl', redirectTo);
      }
      const paramStr = params.toString();
      const url = `${basePath}/signout${paramStr ? `?${paramStr}` : ''}`;
      throw req.redirect(302, url);
    },
    zod$({ redirectTo: z.string().optional() }),
  );

  const useSession = routeLoader$((req) => {
    return req.sharedMap.get('session') as Session | null;
  });

  const onRequest = async (req: RequestEventCommon) => {
    if (!isServer) {
      return;
    }
    const config = await authOptions(req);
    config.basePath ??= '/api/auth';
    setEnvDefaults(process.env, config);
    const basePath = (config.basePath ?? '/api/auth').replace(/\/$/, '');
    if (req.url.pathname.startsWith(basePath + '/')) {
      const response = await Auth(req.request, config);
      req.send(response.status, await response.text());
      return;
    }
    const session = await getSession(req.request, config);
    req.sharedMap.set('session', session);
  };

  return { onRequest, useSession, useSignIn, useSignOut };
}

/**
 * Creates a QwikAuth handler set.
 *
 * Wraps the auth-config factory in a Qwik QRL so its body stays
 * server-only. The returned handlers (`onRequest`, `useSession`,
 * `useSignIn`, `useSignOut`) use Qwik primitives (`globalAction$`,
 * `routeLoader$`) so `@auth/core` and its Node-only dependency graph
 * are dropped from the client bundle by Qwik's optimizer.
 *
 * @example
 * ```ts
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
 * @public
 */
export const QwikAuth$ = implicit$FirstArg(QwikAuthQrl);
