import pluginJS from '@eslint/js';
import pluginTS from 'typescript-eslint';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier/recommended';

const config = [
  pluginJS.configs.recommended,
  ...pluginTS.configs.recommended,
  ...pluginTS.configs.stylistic,
  pluginPrettier,
  {
    files: ['src/**/*.ts'],
    plugins: {
      import: { rules: pluginImport.rules },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      'import/first': 'error',
      'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external', 'unknown'], 'internal', 'parent', ['sibling', 'index'], 'object', 'type'],
          pathGroups: [
            {
              pattern: 'puppeteer',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '@cda-dl/**',
              group: 'internal',
            },
            {
              pattern: 'cda-dl',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          distinctGroup: true,
          alphabetize: {
            order: 'asc',
            caseInsensitive: false,
          },
        },
      ],
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          allowSeparatedGroups: true,
        },
      ],
    },
  },
];

export default config;
