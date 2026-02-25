module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
  },

  plugins: [
    "@typescript-eslint",
    "eslint-plugin-import",
    "eslint-plugin-simple-import-sort",
  ],

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],

  rules: {
    // Disabled for this library specifically
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-explicit-any": "off",

    // Not interested in these checks
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "no-constant-condition": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-base-to-string": "off",

    // Auto-fixes for imports
    "import/no-duplicates": "error",
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
  },

  overrides: [
    {
      files: ["test/**", "*.test.ts", "*.test.tsx"],

      rules: {
        "@typescript-eslint/explicit-module-boundary-types": "off",

        // Allow using `any` in unit tests
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
      },
    },
  ],
};
