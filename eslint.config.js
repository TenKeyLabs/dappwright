const { defineConfig } = require("eslint/config");
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.node,
        ...globals.es5,
      },
      parser: typescriptParser,
      parserOptions: {
        project: ['./tsconfig.json'], // Add the path to your TypeScript config file
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'import': importPlugin,
      'prettier': prettierPlugin
    },
    rules: {
      // Include rules from eslint:recommended
      ...typescriptEslint.configs.recommended.rules,
      ...prettierConfig.rules,

      // Prettier rules
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],

      // TypeScript rules
      '@typescript-eslint/no-require-imports': 'error',
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
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

      // General ESLint rules
      'prefer-const': 'error',
      'no-consecutive-blank-lines': 0,
      'no-console': 'error',

      // // Naming convention rules
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['classProperty', 'parameterProperty', 'objectLiteralProperty', 'classMethod', 'parameter'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Variable must be in camel or upper case
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          filter: {
            regex: '^_',
            match: false,
          },
        },
        // Classes and types must be in PascalCase
        { selector: ['typeLike', 'enum'], format: ['PascalCase'] },
        { selector: 'enumMember', format: null },
        { selector: 'typeProperty', format: ['PascalCase', 'camelCase'] },
        // Ignore rules on destructured params
        {
          selector: 'variable',
          modifiers: ['destructured'],
          format: null,
        },
      ],
    }
  },
  // Override for test files
  {
    files: ['**/test/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  }
]);
