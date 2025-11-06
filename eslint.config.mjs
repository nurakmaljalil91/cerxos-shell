// eslint.config.mjs
import js from '@eslint/js';
import * as tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // Global ignores (also exclude the root HTML document)
  { ignores: ['dist', 'coverage', 'node_modules', '.angular', 'src/index.html'] },

  // JS rules (apply only to JS files)
  {
    files: ['**/*.{js,cjs,mjs}'],
    ...js.configs.recommended,
    rules: {}
  },

  // Angular TS base recommendations (keep as their own entries)
  ...angular.configs.tsRecommended,

  // TypeScript: set parser + typed project + inline-template processing
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: process.cwd()
      }
    },
    plugins: { '@typescript-eslint': tseslint.plugin },
    processor: angular.processInlineTemplates,
    rules: {}
  },

  // TypeScript rules — SCOPED to .ts (do not apply at top-level)
  // We remap the presets so they only run on TS files.
  ...tseslint.configs.recommended.map((c) => ({ ...c, files: ['**/*.ts'] })),
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({ ...c, files: ['**/*.ts'] })),
  ...tseslint.configs.stylisticTypeChecked.map((c) => ({ ...c, files: ['**/*.ts'] })),

  // Your Angular selector prefs (TS only)
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' }
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' }
      ]
    }
  },

  // Angular template rules — scope only to component templates
  ...angular.configs.templateRecommended.map((c) => ({
    ...c,
    files: ['src/app/**/*.html']
  })),
  ...angular.configs.templateAccessibility.map((c) => ({
    ...c,
    files: ['src/app/**/*.html']
  })),

  // Disable ESLint rules that clash with Prettier
  eslintConfigPrettier
];
