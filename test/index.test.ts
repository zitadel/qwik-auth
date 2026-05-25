import { describe, expect, it } from '@jest/globals';

describe('Qwik Auth Package', () => {
  describe('Main Entry Point Exports', () => {
    it('should export QwikAuth$ as a function', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      expect(QwikAuth$).toBeDefined();
      expect(typeof QwikAuth$).toBe('function');
    });

    it('should export QwikAuthQrl as a function', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      expect(QwikAuthQrl).toBeDefined();
      expect(typeof QwikAuthQrl).toBe('function');
    });

    it('should export AuthError', async () => {
      const { AuthError } = await import('../src/index.js');

      expect(AuthError).toBeDefined();
    });

    it('should export CredentialsSignin', async () => {
      const { CredentialsSignin } = await import('../src/index.js');

      expect(CredentialsSignin).toBeDefined();
    });
  });

  describe('QwikAuthQrl return shape', () => {
    it('should return an object with all four handler keys', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];

      const result = QwikAuthQrl(factory);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('onRequest');
      expect(result).toHaveProperty('useSession');
      expect(result).toHaveProperty('useSignIn');
      expect(result).toHaveProperty('useSignOut');
    });

    it('should return onRequest as a function', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];

      const { onRequest } = QwikAuthQrl(factory);

      expect(typeof onRequest).toBe('function');
    });

    it('should return useSession as a function', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];

      const { useSession } = QwikAuthQrl(factory);

      expect(typeof useSession).toBe('function');
    });

    it('should return useSignIn as a function', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];

      const { useSignIn } = QwikAuthQrl(factory);

      expect(typeof useSignIn).toBe('function');
    });

    it('should return useSignOut as a function', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];

      const { useSignOut } = QwikAuthQrl(factory);

      expect(typeof useSignOut).toBe('function');
    });
  });

  describe('signIn URL construction with default basePath /api/auth', () => {
    it('should redirect to /api/auth/signin when a provider is given (provider ignored server-side)', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];
      const { signIn } = QwikAuthQrl(factory);
      const response = await signIn({} as never, 'zitadel');

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/api/auth/signin');
    });

    it('should redirect to /api/auth/signin when no provider is given', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];
      const { signIn } = QwikAuthQrl(factory);
      const response = await signIn({} as never);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/api/auth/signin');
    });

    it('should append callbackUrl as redirectTo query param', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];
      const { signIn } = QwikAuthQrl(factory);
      const response = await signIn({} as never, 'zitadel', {
        redirectTo: '/dashboard',
      });

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        '/api/auth/signin?callbackUrl=%2Fdashboard',
      );
    });

    it('should not append query string when redirectTo is not provided', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];
      const { signIn } = QwikAuthQrl(factory);
      const response = await signIn({} as never, 'zitadel', {});

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/api/auth/signin');
    });
  });

  describe('signOut URL construction with default basePath /api/auth', () => {
    it('should redirect to /api/auth/signout', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];
      const { signOut } = QwikAuthQrl(factory);
      const response = await signOut({} as never);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/api/auth/signout');
    });

    it('should append callbackUrl as redirectTo query param on signOut', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];
      const { signOut } = QwikAuthQrl(factory);
      const response = await signOut({} as never, { redirectTo: '/' });

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        '/api/auth/signout?callbackUrl=%2F',
      );
    });

    it('should not append query string when redirectTo is not provided', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];
      const { signOut } = QwikAuthQrl(factory);
      const response = await signOut({} as never, {});

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/api/auth/signout');
    });
  });

  describe('Custom basePath support', () => {
    it('should use custom basePath in signIn URL', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
        basePath: '/custom-auth',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];
      const { signIn } = QwikAuthQrl(factory);
      const response = await signIn({} as never, 'zitadel');

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/custom-auth/signin');
    });

    it('should use custom basePath in signOut URL', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
        basePath: '/custom-auth',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];
      const { signOut } = QwikAuthQrl(factory);
      const response = await signOut({} as never);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/custom-auth/signout');
    });

    it('should strip trailing slash from custom basePath', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
        basePath: '/custom-auth/',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];
      const { signIn } = QwikAuthQrl(factory);
      const response = await signIn({} as never, 'zitadel');

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/custom-auth/signin');
    });

    it('should use custom basePath with redirectTo in signIn URL', async () => {
      const { QwikAuthQrl } = await import('../src/index.js');

      const factory = (() => ({
        providers: [],
        secret: 'test-secret',
        basePath: '/myauth',
      })) as unknown as Parameters<typeof QwikAuthQrl>[0];
      const { signIn } = QwikAuthQrl(factory);
      const response = await signIn({} as never, 'zitadel', {
        redirectTo: '/profile',
      });

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        '/myauth/signin?callbackUrl=%2Fprofile',
      );
    });
  });

  describe('Adapter Entry Point', () => {
    it('should be importable', async () => {
      const module = await import('../src/adapter.js');

      expect(module).toBeDefined();
    });
  });
});
