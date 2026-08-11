// Flat config. ESLint 9 no longer reads `.eslintrc.json`, and Next 16 dropped the
// `next lint` command, so linting runs through `eslint` directly — see the `lint`
// script in package.json.
//
// This mirrors the previous `.eslintrc.json`:
//   next/core-web-vitals            -> eslint-config-next/core-web-vitals
//   next/typescript                 -> bundled inside core-web-vitals above
//   eslint:recommended              -> @eslint/js recommended
//   plugin:@typescript-eslint/...   -> eslint-config-next/typescript
//   prettier                        -> eslint-config-prettier (must stay last)

import js from '@eslint/js';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

const config = [
  // Replaces .eslintignore, which flat config no longer reads.
  // `.claude/worktrees/` holds full working copies of this repo (Claude Code
  // scratch space, untracked). Without this, `eslint .` walks thousands of
  // duplicated source files and effectively hangs.
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '.claude/**',
      'next-env.d.ts',
      'public/**',
    ],
  },
  js.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
];

export default config;
