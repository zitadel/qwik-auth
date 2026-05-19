/**
 * Vite library build for `@zitadel/qwik-auth`.
 *
 * Mirrors upstream `@auth/qwik`'s build pipeline: the `qwikVite` plugin
 * tags the emitted modules with Qwik markers (server-only QRL bodies,
 * `globalAction$`/`routeLoader$` boundaries, `isServer` constant) so
 * that when a consumer Qwik app bundles this package, its own qwik
 * optimizer can prove the server-only code unreachable from the client
 * graph and drop `@auth/core` (and its Node-only transitive deps such
 * as `@panva/hkdf`) from the client bundle.
 *
 * The output filename intentionally uses the `.qwik.js` suffix and is
 * advertised via the top-level `"qwik"` field in `package.json`, which
 * is how the consumer-side `qwikVite` resolver locates the
 * qwik-processable entry. Building this package with a plain bundler
 * (tsup, esbuild, etc.) would strip the markers and force `@auth/core`
 * into the client bundle.
 */
import { qwikVite } from '@builder.io/qwik/optimizer';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  build: {
    minify: false,
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: {
        index: './src/index.ts',
        client: './src/client.ts',
        adapter: './src/adapter.ts',
      },
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.qwik.js`,
    },
    rollupOptions: {
      external: [
        '@auth/core',
        '@auth/core/errors',
        '@auth/core/types',
        '@auth/core/adapters',
        '@builder.io/qwik',
        '@builder.io/qwik-city',
        '@builder.io/qwik/build',
      ],
    },
  },
  plugins: [
    qwikVite(),
    dts({
      outDir: 'dist',
      entryRoot: 'src',
      tsconfigPath: './tsconfig.json',
      rollupTypes: false,
    }),
  ],
});
