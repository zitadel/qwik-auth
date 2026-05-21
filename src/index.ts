import {
  Auth,
  type AuthConfig,
  setEnvDefaults,
  createActionURL,
  isAuthAction,
} from '@auth/core';
import type { AuthAction, Session } from '@auth/core/types';
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
 * Server-only helper: fetches the current session by issuing a synthetic
 * GET against the Auth.js session endpoint. Used internally by
 * {@link QwikAuthQrl}'s `onRequest` middleware. Not exported from the
 * package surface because its body imports `@auth/core` at module top
 * level; exporting it would defeat tree-shaking and pull the Auth.js
 * runtime into the consumer's client bundle.
 *
 * @internal
 */
async function getSession(
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

  /**
   * Server-side helper to start the Auth.js sign-in flow.
   *
   * Unlike the other SDKs in this family, `event` must be passed
   * first: the SDK's config is request-scoped (resolved by the QRL
   * factory on each invocation) so the request context is needed to
   * compute the active `basePath`.
   *
   * Returns a `Response.redirect()` matching the canonical shape
   * used by the other SDK families.
   *
   * @public
   */
  async function signIn(
    event: RequestEventCommon,
    provider?: string,
    options: { redirectTo?: string } = {},
  ): Promise<Response> {
    const config = await authOptions(event);
    config.basePath ??= '/api/auth';
    const basePath = (config.basePath ?? '/api/auth').replace(/\/$/, '');
    const params = new URLSearchParams();
    if (options.redirectTo) params.set('callbackUrl', options.redirectTo);
    const paramStr = params.toString();
    const url = provider
      ? `${basePath}/signin/${provider}${paramStr ? `?${paramStr}` : ''}`
      : `${basePath}/signin${paramStr ? `?${paramStr}` : ''}`;
    return Response.redirect(url, 302);
  }

  /**
   * Server-side helper to start the Auth.js sign-out flow. Same
   * request-scoping caveat as {@link signIn}.
   *
   * @public
   */
  async function signOut(
    event: RequestEventCommon,
    options: { redirectTo?: string } = {},
  ): Promise<Response> {
    const config = await authOptions(event);
    config.basePath ??= '/api/auth';
    const basePath = (config.basePath ?? '/api/auth').replace(/\/$/, '');
    const params = new URLSearchParams();
    if (options.redirectTo) params.set('callbackUrl', options.redirectTo);
    const paramStr = params.toString();
    const url = `${basePath}/signout${paramStr ? `?${paramStr}` : ''}`;
    return Response.redirect(url, 302);
  }

  const onRequest = async (req: RequestEventCommon) => {
    if (!isServer) {
      return;
    }
    const config = await authOptions(req);
    config.basePath ??= '/api/auth';
    setEnvDefaults(process.env, config);
    const basePath = (config.basePath ?? '/api/auth').replace(/\/$/, '');
    // Match upstream `@auth/qwik`: only delegate to Auth.js when the
    // first path segment after basePath is a recognised Auth.js action
    // (signin/signout/callback/csrf/providers/session/error/verify-request).
    // This lets consumers add their own routes under the same basePath
    // (e.g. /api/auth/logout/callback for OIDC RP-initiated logout)
    // without the SDK intercepting them.
    const action = req.url.pathname
      .slice(basePath.length + 1)
      .split('/')[0] as AuthAction;
    if (isAuthAction(action) && req.url.pathname.startsWith(basePath + '/')) {
      // Forward the full Auth.js Response — status, headers (including
      // Set-Cookie and Location for redirects), and body. `req.send`
      // accepts a Response and copies these fields onto the outgoing
      // reply; `throw` short-circuits further middleware/loaders.
      throw req.send(await Auth(req.request, config));
    }
    const session = await getSession(req.request, config);
    req.sharedMap.set('session', session);
  };

  return { onRequest, useSession, useSignIn, useSignOut, signIn, signOut };
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
