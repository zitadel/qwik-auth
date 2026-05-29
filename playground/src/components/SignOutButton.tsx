import { component$ } from '@builder.io/qwik';
import { signOut } from '@zitadel/qwik-auth/client';

// noinspection JSUnusedGlobalSymbols
export const SignOutButton = component$(() => {
  return (
    <button
      type="button"
      data-testid="signout-button"
      onClick$={() => signOut({ callbackUrl: '/' })}
      class="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-red-600"
    >
      Sign out
    </button>
  );
});
