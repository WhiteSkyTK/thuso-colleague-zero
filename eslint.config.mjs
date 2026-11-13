import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import sonarjs from 'eslint-plugin-sonarjs';

const MAX_COGNITIVE_COMPLEXITY = 15;
const MAX_PARAMS = 3;

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  sonarjs.configs.recommended,
  prettier,
  {
    // CLAUDE.md §8 — the rules we promised, enforced.
    rules: {
      'no-console': 'error',
      'no-nested-ternary': 'error',
      'max-params': ['error', MAX_PARAMS],
      'sonarjs/cognitive-complexity': ['error', MAX_COGNITIVE_COMPLEXITY],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
    },
  },
  {
    // The engine is framework-free: it must not reach into React, Next.js or the app.
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['react', 'react-dom', 'next', 'next/*', '@/app/*', '@/components/*'] },
      ],
    },
  },
  {
    // Seed data is generated with a fixed-seed generator on purpose; it is not security code.
    files: ['scripts/generateSeed.ts'],
    rules: { 'sonarjs/pseudo-random': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'data/**', 'next-env.d.ts']),
]);
