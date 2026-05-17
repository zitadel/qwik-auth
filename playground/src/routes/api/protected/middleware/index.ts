import { type RequestHandler } from '@builder.io/qwik-city';
import type { Session } from '@auth/core/types';

/** Middleware-protected endpoint — auth enforced by plugin@auth.ts. */
// noinspection JSUnusedGlobalSymbols
export const onGet: RequestHandler = ({ sharedMap, json }) => {
  const session = (sharedMap.get('session') as Session | null) ?? null;
  if (!session) {
    json(403, { error: 'Forbidden' });
    return;
  }
  json(200, { ok: true });
};
