import { fileURLToPath } from 'node:url'

import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import boundaries from 'eslint-plugin-boundaries'
import importX from 'eslint-plugin-import-x'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// The one module allowed to read `process.env` / `import.meta.env` (ARC-08).
const ENV_CONFIG_MODULE = 'src/shared/config/env.ts'
// The one module allowed to call `console.warn` / `console.error` (TS-04).
const SERVER_LOG_MODULE = 'src/shared/server/log.ts'

const TEST_FILES = ['**/*.test.{ts,tsx}', 'e2e/**']
const SIZE_EXEMPT_FILES = [
  ...TEST_FILES,
  '**/fixtures/**',
  '**/*.fixture.{ts,tsx}',
  '**/seed/**',
  '**/seed.ts',
]
const TOOLING_FILES = ['*.config.ts', 'scripts/**/*.ts', 'types/**/*.d.ts']

const SIZE_OPTIONS = { skipBlankLines: true, skipComments: true }

// Layers of ARC-01, top to bottom. Each one may import the layers below it,
// never one above it nor a sibling element of its own type.
const LAYERS = ['routes', 'pages', 'widgets', 'features', 'entities', 'shared']

const RESTRICTED_SYNTAX = [
  {
    selector: "TSAsExpression[typeAnnotation.type='TSNeverKeyword']",
    message: '`as never` hides a type error; fix the type instead (TS-05).',
  },
  {
    selector:
      'JSXAttribute[name.name=/^(width|height|size|iconSize)$/] > JSXExpressionContainer > Literal[raw=/^[-+.0-9]/]',
    message: 'Sizes come from the token scale, not numeric literals (UI-03).',
  },
  {
    selector:
      "CallExpression[callee.property.name=/^(email|uuid|guid|url|emoji|base64|base64url|nanoid|cuid|cuid2|ulid|ipv4|ipv6|cidrv4|cidrv6|e164|jwt|datetime|date|time|duration)$/] > MemberExpression.callee CallExpression[callee.object.name='z'][callee.property.name='string']",
    message:
      'Deprecated Zod string format: use the top-level form (`z.email()`, `z.uuid()`, `z.url()`, `z.iso.datetime()`…) (DATA-02).',
  },
]

const ENV_SYNTAX = [
  {
    selector: "MemberExpression[object.name='process'][property.name='env']",
    message: `Read environment values only in ${ENV_CONFIG_MODULE} (ARC-08).`,
  },
  {
    selector:
      "MemberExpression[object.type='MetaProperty'][property.name='env']",
    message: `Read environment values only in ${ENV_CONFIG_MODULE} (ARC-08).`,
  },
]

const allowLayersBelow = (layer: string) => ({
  from: { element: { type: layer } },
  allow: {
    to: {
      element: {
        types: [
          ...LAYERS.slice(LAYERS.indexOf(layer) + 1),
          'convex-api',
          'theme',
        ],
      },
    },
  },
})

export default defineConfig(
  globalIgnores([
    '**/dist/**',
    '.wrangler/**',
    'node_modules/**',
    'playwright-report/**',
    'test-results/**',
    'docs/**',
    '.agents/**',
    '.claude/**',
    'themes/**',
    'convex/_generated/**',
    'src/routeTree.gen.ts',
    'src/astryx-themes.js',
    'src/themes/**',
  ]),

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  jsxA11y.flatConfigs.recommended,
  importX.flatConfigs.typescript,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
      },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      boundaries,
      'import-x': importX,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver()],
      // eslint-plugin-boundaries resolves imports with the legacy setting.
      'import/resolver': { typescript: true },
      // Folders are elements; the few loose files are classified by category.
      'boundaries/elements': [
        { type: 'routes', pattern: 'src/routes', partialMatch: false },
        {
          type: 'pages',
          pattern: 'src/pages/*',
          capture: ['page'],
          partialMatch: false,
        },
        {
          type: 'widgets',
          pattern: 'src/widgets/*',
          capture: ['widget'],
          partialMatch: false,
        },
        {
          type: 'features',
          pattern: 'src/features/*',
          capture: ['feature'],
          partialMatch: false,
        },
        {
          type: 'entities',
          pattern: 'src/entities/*',
          capture: ['entity'],
          partialMatch: false,
        },
        {
          type: 'shared',
          pattern: 'src/shared/*',
          capture: ['segment'],
          partialMatch: false,
        },
        { type: 'theme', pattern: 'src/themes', partialMatch: false },
        { type: 'theme', pattern: 'src/styles', partialMatch: false },
        {
          type: 'convex-api',
          pattern: 'convex/_generated',
          partialMatch: false,
        },
        { type: 'convex', pattern: 'convex', partialMatch: false },
        { type: 'e2e', pattern: 'e2e', partialMatch: false },
      ],
      'boundaries/files': [
        {
          pattern: 'src/{router.tsx,routeTree.gen.ts,vite-env.d.ts}',
          category: 'app',
        },
        { pattern: 'src/astryx-themes.js', category: 'theme' },
        ...TOOLING_FILES.map((pattern) => ({ pattern, category: 'tooling' })),
      ],
      'boundaries/include': [
        'src/**/*',
        'convex/**/*',
        'e2e/**/*',
        ...TOOLING_FILES,
      ],
    },
    rules: {
      'boundaries/no-unknown-files': 'error',
      'boundaries/no-unknown-dependencies': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { file: { categories: 'app' } },
              allow: { to: { element: { types: ['routes', 'shared'] } } },
            },
            {
              from: { file: { categories: 'app' } },
              allow: { to: { file: { categories: ['app', 'theme'] } } },
            },
            // The theme (Astryx output and global CSS) sits beside the layers.
            {
              from: { element: { types: LAYERS } },
              allow: { to: { file: { categories: 'theme' } } },
            },
            ...LAYERS.map(allowLayersBelow),
            // convex/ is the backend: it never imports from src/.
            {
              from: { element: { type: 'convex' } },
              allow: { to: { element: { type: 'convex-api' } } },
            },
            {
              from: { element: { type: 'e2e' } },
              allow: { to: { element: { type: 'shared' } } },
            },
          ],
        },
      ],

      'import-x/no-cycle': 'error',
      'import-x/no-duplicates': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
        },
      ],

      'id-length': ['error', { min: 2, exceptions: ['_'] }],
      'max-lines': ['error', { max: 300, ...SIZE_OPTIONS }],
      'max-lines-per-function': ['error', { max: 100, ...SIZE_OPTIONS }],
      complexity: ['error', 12],
      'max-depth': ['error', 4],
      'max-params': ['error', 4],
      '@typescript-eslint/max-params': ['error', { max: 4 }],

      'no-restricted-syntax': ['error', ...RESTRICTED_SYNTAX, ...ENV_SYNTAX],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'vitest',
                'vitest/*',
                'convex-test',
                '@playwright/test',
                '@axe-core/playwright',
                '**/*.test',
                '**/*.test.*',
                '**/mocks/**',
                '**/__mocks__/**',
                '**/test-utils',
                '**/test-utils/**',
                '**/fixtures/**',
              ],
              message:
                'App code never imports mocks or test utilities (ARC-02).',
            },
          ],
        },
      ],
    },
  },

  // Generic ESLint core rule superseded by the TypeScript-aware one above.
  { rules: { 'max-params': 'off' } },

  // Every jsx-a11y recommended rule is an error, never a warning (UI-02).
  {
    rules: Object.fromEntries(
      Object.keys(jsxA11y.flatConfigs.recommended.rules).map((rule) => [
        rule,
        'error',
      ]),
    ),
  },

  {
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: { 'max-lines': ['error', { max: 30, ...SIZE_OPTIONS }] },
  },
  {
    files: ['src/routes/__root.tsx'],
    rules: { 'max-lines': ['error', { max: 60, ...SIZE_OPTIONS }] },
  },
  {
    files: ['src/pages/**/*.tsx'],
    rules: { 'max-lines': ['error', { max: 220, ...SIZE_OPTIONS }] },
  },
  {
    files: SIZE_EXEMPT_FILES,
    rules: { 'max-lines': 'off' },
  },

  {
    files: [...TEST_FILES, ...TOOLING_FILES],
    rules: { 'no-restricted-imports': 'off' },
  },
  // Tooling configs run in Node outside the app; they read the process
  // environment directly (ARC-08 covers src/, convex/ and e2e/).
  {
    files: [ENV_CONFIG_MODULE, ...TOOLING_FILES],
    rules: { 'no-restricted-syntax': ['error', ...RESTRICTED_SYNTAX] },
  },
  {
    files: [SERVER_LOG_MODULE],
    rules: { 'no-console': ['error', { allow: ['warn', 'error'] }] },
  },

  prettier,
)
