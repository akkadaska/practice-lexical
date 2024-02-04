module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    "next/core-web-vitals",
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        'argsIgnorePattern': '^_'
      }
    ],
    'no-console': [
      'warn',
      {
        allow: [
          'error',
          'warn',
          'info',
        ]
      }
    ],
    eqeqeq: [
      'error'
    ],
    'prettier/prettier': [
      'error'
    ]
  }
};
