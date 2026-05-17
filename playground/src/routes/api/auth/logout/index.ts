import { type RequestHandler } from '@builder.io/qwik-city';

// noinspection JSUnusedGlobalSymbols

/**
 * The application uses Auth.js's built-in /api/auth/signout for sign-out.
 * This endpoint exists only to satisfy the logout route structure and is not
 * called by the UI. Back-channel logout (OIDC RP-Initiated Logout) is not
 * implemented in the playground.
 */
export const onPost: RequestHandler = ({ json }) => {
  json(405, { error: 'Method not allowed' });
};
