module.exports = {
  root: true,
  env: {
    mocha: true,
    node: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'eslint-plugin-import', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
      },
    ],
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-use-before-define': 'off',
    'prefer-const': 'error',
    'no-consecutive-blank-lines': 0,
    'no-console': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: ['classProperty', 'parameterProperty', 'objectLiteralProperty', 'classMethod', 'parameter'],
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      //variable must be in camel or upper case
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        filter: {
          regex: '^_',
          match: false,
        },
      },
      // {selector: "variable", modifiers: ["global"], format: ["PascalCase", "UPPER_CASE"]},
      //classes and types must be in PascalCase
      { selector: ['typeLike', 'enum'], format: ['PascalCase'] },
      { selector: 'enumMember', format: null },
      { selector: 'typeProperty', format: ['PascalCase', 'camelCase'] },
      //ignore rules on destructured params
      {
        selector: 'variable',
        modifiers: ['destructured'],
        format: null,
      },
    ],
  },
  overrides: [
    {
      files: ['**/test/**/*.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
