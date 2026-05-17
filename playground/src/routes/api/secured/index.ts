import { type RequestHandler } from '@builder.io/qwik-city';
import type { Session } from '@auth/core/types';

/** Protected endpoint — returns 403 when the request is unauthenticated. */
// noinspection JSUnusedGlobalSymbols
export const onGet: RequestHandler = ({ sharedMap, json }) => {
  const session = (sharedMap.get('session') as Session | null) ?? null;
  if (!session) {
    json(403, { error: 'Forbidden' });
    return;
  }
  json(200, { ok: true });
};
