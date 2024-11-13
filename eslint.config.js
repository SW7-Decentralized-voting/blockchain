import globals from "globals";
import pluginJs from "@eslint/js";
import jest from "eslint-plugin-jest";
import jsdoc from "eslint-plugin-jsdoc";


export default [
  {
    plugins: { jsdoc },
    rules: {
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-undef": "error",
      "no-console": "warn",
      "no-extra-semi": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-empty": "error",
      ...jsdoc.configs.recommended.rules,
      "jsdoc/check-types": "off"
    },
    ignores: ["node_modules/", "eslint.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["__test__/*", "**/*.test.js"],
    plugins: { jest },
    rules: {
      ...jest.configs.recommended.rules,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      }
    }
  },
  pluginJs.configs.recommended,
];