export default {
  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  testEnvironment: 'node',
  testMatch: ['**/*.+(spec|test).[tj]s?(x)'],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'mjs',
    'jsx',
    'mts',
    'json',
    'node',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend/',
    '/dist/',
    '/spec/',
    '/playground/',
  ],
  resetModules: false,
  collectCoverage: true,
  coverageDirectory: './build/coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
  coverageReporters: ['clover', 'cobertura', 'lcov'],
  coveragePathIgnorePatterns: ['/dist/', '/spec/', '/node_modules/'],
  testTimeout: 60000,
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.mts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@builder\\.io/qwik/build$': '<rootDir>/test/__mocks__/qwik-build.ts',
    '^@builder\\.io/qwik$': '<rootDir>/test/__mocks__/qwik.ts',
    '^@builder\\.io/qwik-city$': '<rootDir>/test/__mocks__/qwik-city.ts',
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './build/reports',
        outputName: 'junit.xml',
      },
    ],
  ],
};
