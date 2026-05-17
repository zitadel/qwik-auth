import { type RequestHandler } from '@builder.io/qwik-city';

// noinspection JSUnusedGlobalSymbols
/**
 * Handles the logout callback by clearing all Auth.js session cookies and
 * redirecting to the success page. Used by Playwright tests to verify cookie
 * clearing. State validation is omitted in the playground.
 */
export const onGet: RequestHandler = ({ cookie, redirect }) => {
  for (const name of Object.keys(cookie.getAll())) {
    if (name.startsWith('authjs.')) {
      cookie.delete(name, { path: '/' });
    }
  }
  throw redirect(302, '/');
};
