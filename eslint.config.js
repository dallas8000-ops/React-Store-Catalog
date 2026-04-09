
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.browser, ...globals.es2025 },
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    plugins: {
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...react.configs.recommended.rules,
      'react/prop-types': 'off',
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_', ignoreRestSiblings: true }]
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  // Node.js override for server files
  {
    files: ['server/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.node, ...globals.es2025 },
      parserOptions: { sourceType: 'script' }
    },
    rules: {
      'no-undef': 'off'
    }
  }
]