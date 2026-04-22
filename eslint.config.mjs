// @ts-check
import js from "@eslint/js";
import importPlugin from "eslint-plugin-import-x";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "coverage/**", "docs/**", ".turbo/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["src/**/*.{ts,tsx}", "test/**/*.{ts,tsx}", "test-d/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "import-x": importPlugin,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // Disabled for this library specifically
      "@typescript-eslint/no-explicit-any": "off",
      // `ban-types` was split in typescript-eslint v8 — disable the replacements too
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",

      // Not interested in these checks
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "no-constant-condition": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-base-to-string": "off",

      // Auto-fixes for imports
      "import-x/no-duplicates": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Customized default rules
      eqeqeq: ["error", "always"],
      quotes: [
        "error",
        "double",
        { avoidEscape: true, allowTemplateLiterals: false },
      ],
      "object-shorthand": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { args: "all", argsIgnorePattern: "^_.*", varsIgnorePattern: "^_.*" },
      ],

      // "The Code is the To-Do List"
      "no-warning-comments": ["error", { terms: ["xxx"], location: "anywhere" }],

      // abort() throws Response as a control-flow mechanism
      "@typescript-eslint/only-throw-error": ["error", { allow: ["Response"] }],
    },
  },
  {
    files: ["test/**/*.{ts,tsx}", "**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // Allow using `any` in unit tests
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  }
);
