import { type RequestHandler } from '@builder.io/qwik-city';

/** Public endpoint — accessible without authentication. */
// noinspection JSUnusedGlobalSymbols
export const onGet: RequestHandler = ({ json }) => {
  json(200, { ok: true });
};
