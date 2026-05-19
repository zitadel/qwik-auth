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

  describe('Adapter Entry Point', () => {
    it('should be importable', async () => {
      const module = await import('../src/adapter.js');

      expect(module).toBeDefined();
    });
  });
});
