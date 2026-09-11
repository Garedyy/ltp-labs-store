import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import i18next from "eslint-plugin-i18next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

// Design-system primitives that render native elements, so jsx-a11y checks them as such.
const componentMap = { Button: "button", ButtonLink: "a", Checkbox: "input", Select: "select" };

export default defineConfig([
  globalIgnores(["build/", ".react-router/", "playwright-report/", "test-results/", "coverage/"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,
  {
    ...jsxA11y.flatConfigs.strict,
    settings: { "jsx-a11y": { components: componentMap } },
  },
  {
    files: ["app/**/*.{ts,tsx}"],
    ignores: ["app/**/*.test.{ts,tsx}"],
    plugins: { i18next },
    rules: {
      "i18next/no-literal-string": [
        "error",
        {
          mode: "jsx-only",
          "jsx-attributes": {
            exclude: [
              "className",
              "to",
              "href",
              "name",
              "value",
              "id",
              "type",
              "rel",
              "target",
              "role",
              "lang",
              "hrefLang",
              "dir",
              "action",
              "method",
              "autoComplete",
              "autoCapitalize",
              "inputMode",
              "pattern",
              "viewBox",
              "fill",
              "d",
              "loading",
              "decoding",
              "fetchPriority",
              "crossOrigin",
              "as",
              "charSet",
              "content",
              "dateTime",
              "prefetch",
              "variant",
              "size",
              "aria-describedby",
              "aria-labelledby",
              "aria-controls",
              "aria-current",
              "aria-live",
              "aria-atomic",
              "data-testid",
            ],
          },
        },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: "detect" } },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": "warn",
      "no-restricted-imports": [
        "error",
        { paths: [{ name: "react-router-dom", message: "Import from react-router instead." }] },
      ],
    },
  },
  {
    files: ["scripts/**/*.mjs", "tests/e2e/**/*.ts"],
    rules: { "no-console": "off" },
  },
  prettier,
]);
