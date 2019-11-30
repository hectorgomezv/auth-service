module.exports = {
  env: {
    es6: true,
    node: true,
    'jest/globals': true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: [
    'jest',
  ],
  rules: {
    'arrow-parens': 'off',
    'no-underscore-dangle': 'off',
    'security/detect-object-injection': 'off',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
		'jest/valid-expect': 'error'
  },
};
