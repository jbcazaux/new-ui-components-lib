import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactDom from 'eslint-plugin-react-dom'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import stylistic from '@stylistic/eslint-plugin'
import eslintReact from "@eslint-react/eslint-plugin";

export default defineConfig([
  globalIgnores(['dist', '*.config.*js']),
  {
    extends: [
      js.configs.recommended,
      eslintPluginPrettierRecommended,
      eslintReact.configs["recommended-typescript"],
      reactDom.configs.recommended,
      reactHooks.configs.flat.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactRefresh.configs.vite,
      importPlugin.flatConfigs.recommended, 
      importPlugin.flatConfigs.typescript,
    ],
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/jsx-quotes': ["error", "prefer-double"],
      'arrow-body-style': 'error',
      eqeqeq: 'error',
      'no-console': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-vars': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      "prettier/prettier": [
        "error",
        {
          "endOfLine": "auto"
        }
      ],
      quotes: ["error", "single", { "avoidEscape": true }],
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/unsupported-syntax': 'error',
      'react-hooks/incompatible-library': 'error',
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          groups: ['builtin', "external", "internal", 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
        },
      ]
    },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        projectService: true,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: 'tsconfig.json',
        },
      },
    },
  },
  {
    linterOptions: {
      reportUnusedInlineConfigs: 'error',
			reportUnusedDisableDirectives: "error",
    },
  }
])
