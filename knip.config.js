module.exports = {
  ignore: ['commitlint.config.js', 'dist/**', 'build/**', 'typedoc.config.mjs'],
  ignoreDependencies: [
    '@commitlint/config-conventional',
    '@semantic-release/.*?',
    '@jest/globals',
    '@builder.io/qwik',
    '@builder.io/qwik-city',
  ],
};
