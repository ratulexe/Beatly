export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'node_modules_bad/**',
      'node_modules_kill/**',
      'node_modules_kill2/**'
    ]
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        browser: 'readonly',
        console: 'readonly',
        crypto: 'readonly',
        CustomEvent: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        window: 'readonly'
      }
    },
    rules: {}
  }
];
