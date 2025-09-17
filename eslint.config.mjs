import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([
  globalIgnores([
    "coverage/**/*",
    "docs/**/*",
    "node_modules/**/*",
    "build/**/*"
  ]),
  {
    extends: compat.extends("plugin:@typescript-eslint/recommended"),

    plugins: {
      "@typescript-eslint": typescriptEslint
    },

    languageOptions: {
      globals: {
        ...Object.fromEntries(
          Object.entries(globals.browser).map(([key]) => [key, "off"])
        ),
        ...globals.node,
        ...globals.jest,
        __DEV__: false,
        __TEST__: false,
        __PROD__: false,
        __COVERAGE__: false
      },

      parser: tsParser
    },

    rules: {
      "brace-style": [2, "1tbs"],
      "comma-dangle": [2, "never"],

      indent: [
        "error",
        2,
        {
          SwitchCase: 1
        }
      ],

      "key-spacing": 0,
      "max-len": [0, 120, 2],

      "max-lines-per-function": [
        "warn",
        {
          max: 30,
          skipBlankLines: true,
          skipComments: true
        }
      ],

      "@typescript-eslint/no-unused-vars": [
        1,
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: false,
          argsIgnorePattern: "^_"
        }
      ],

      "no-var": 1,
      "object-curly-spacing": [2, "always"],

      "prefer-const": [
        1,
        {
          destructuring: "any",
          ignoreReadBeforeAssign: true
        }
      ],

      semi: [2, "always"],
      "space-in-parens": ["error", "never"],
      complexity: ["warn", 6],
      "@typescript-eslint/no-explicit-any": "warn"
    }
  },
  {
    files: ["tests/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off"
    }
  }
]);
