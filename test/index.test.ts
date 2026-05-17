import { describe, expect, it } from '@jest/globals';

describe('Qwik Auth Package', () => {
  describe('Main Entry Point Exports', () => {
    it('should export QwikAuth$ as a function', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      expect(QwikAuth$).toBeDefined();
      expect(typeof QwikAuth$).toBe('function');
    });

    it('should export getSession as a function', async () => {
      const { getSession } = await import('../src/index.js');

      expect(getSession).toBeDefined();
      expect(typeof getSession).toBe('function');
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

  describe('QwikAuth$ return shape', () => {
    it('should return an object when called with a plain config', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const result = QwikAuth$({ providers: [], secret: 'test-secret' });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should return onRequest as a function', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { onRequest } = QwikAuth$({ providers: [], secret: 'test-secret' });

      expect(typeof onRequest).toBe('function');
    });

    it('should return useSession as a function that accepts an event', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { useSession } = QwikAuth$({ providers: [], secret: 'test-secret' });

      expect(typeof useSession).toBe('function');
      expect(useSession.length).toBe(1);
    });

    it('should return useSignIn as a function', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { useSignIn } = QwikAuth$({ providers: [], secret: 'test-secret' });

      expect(typeof useSignIn).toBe('function');
    });

    it('should return useSignOut as a function', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { useSignOut } = QwikAuth$({ providers: [], secret: 'test-secret' });

      expect(typeof useSignOut).toBe('function');
    });
  });

  describe('QwikAuth$ useSignIn URL construction', () => {
    it('should navigate to /api/auth/signin/{provider} when provider is given', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { useSignIn } = QwikAuth$({ providers: [], secret: 'test-secret' });

      const mockWindow = { location: { href: '' } };
      (global as Record<string, unknown>).window = mockWindow;

      await useSignIn('zitadel');

      expect(mockWindow.location.href).toBe('/api/auth/signin/zitadel');

      delete (global as Record<string, unknown>).window;
    });

    it('should navigate to /api/auth/signin when no provider is given', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { useSignIn } = QwikAuth$({ providers: [], secret: 'test-secret' });

      const mockWindow = { location: { href: '' } };
      (global as Record<string, unknown>).window = mockWindow;

      await useSignIn();

      expect(mockWindow.location.href).toBe('/api/auth/signin');

      delete (global as Record<string, unknown>).window;
    });

    it('should append callbackUrl query param when redirectTo is provided', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { useSignIn } = QwikAuth$({ providers: [], secret: 'test-secret' });

      const mockWindow = { location: { href: '' } };
      (global as Record<string, unknown>).window = mockWindow;

      await useSignIn('zitadel', { redirectTo: '/dashboard' });

      expect(mockWindow.location.href).toBe(
        '/api/auth/signin/zitadel?callbackUrl=%2Fdashboard',
      );

      delete (global as Record<string, unknown>).window;
    });

    it('should not navigate when window is undefined', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { useSignIn } = QwikAuth$({ providers: [], secret: 'test-secret' });

      delete (global as Record<string, unknown>).window;

      await expect(useSignIn('zitadel')).resolves.toBeUndefined();
    });

    it('should respect custom basePath', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { useSignIn } = QwikAuth$({
        providers: [],
        secret: 'test-secret',
        basePath: '/my-auth',
      });

      const mockWindow = { location: { href: '' } };
      (global as Record<string, unknown>).window = mockWindow;

      await useSignIn('zitadel');

      expect(mockWindow.location.href).toBe('/my-auth/signin/zitadel');

      delete (global as Record<string, unknown>).window;
    });

    it('should strip trailing slash from basePath', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { useSignIn } = QwikAuth$({
        providers: [],
        secret: 'test-secret',
        basePath: '/my-auth/',
      });

      const mockWindow = { location: { href: '' } };
      (global as Record<string, unknown>).window = mockWindow;

      await useSignIn('zitadel');

      expect(mockWindow.location.href).toBe('/my-auth/signin/zitadel');

      delete (global as Record<string, unknown>).window;
    });
  });

  describe('QwikAuth$ useSignOut URL construction', () => {
    it('should navigate to /api/auth/signout', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { useSignOut } = QwikAuth$({ providers: [], secret: 'test-secret' });

      const mockWindow = { location: { href: '' } };
      (global as Record<string, unknown>).window = mockWindow;

      await useSignOut();

      expect(mockWindow.location.href).toBe('/api/auth/signout');

      delete (global as Record<string, unknown>).window;
    });

    it('should append callbackUrl query param when redirectTo is provided', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { useSignOut } = QwikAuth$({ providers: [], secret: 'test-secret' });

      const mockWindow = { location: { href: '' } };
      (global as Record<string, unknown>).window = mockWindow;

      await useSignOut({ redirectTo: '/' });

      expect(mockWindow.location.href).toBe(
        '/api/auth/signout?callbackUrl=%2F',
      );

      delete (global as Record<string, unknown>).window;
    });

    it('should not navigate when window is undefined', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { useSignOut } = QwikAuth$({ providers: [], secret: 'test-secret' });

      delete (global as Record<string, unknown>).window;

      await expect(useSignOut()).resolves.toBeUndefined();
    });

    it('should respect custom basePath', async () => {
      const { QwikAuth$ } = await import('../src/index.js');

      const { useSignOut } = QwikAuth$({
        providers: [],
        secret: 'test-secret',
        basePath: '/my-auth',
      });

      const mockWindow = { location: { href: '' } };
      (global as Record<string, unknown>).window = mockWindow;

      await useSignOut();

      expect(mockWindow.location.href).toBe('/my-auth/signout');

      delete (global as Record<string, unknown>).window;
    });
  });

  describe('getSession export signature', () => {
    it('should accept 2 parameters (request, config)', async () => {
      const { getSession } = await import('../src/index.js');

      expect(getSession.length).toBe(2);
    });
  });

  describe('Adapter Entry Point', () => {
    it('should be importable', async () => {
      const module = await import('../src/adapter.js');

      expect(module).toBeDefined();
    });
  });
});
