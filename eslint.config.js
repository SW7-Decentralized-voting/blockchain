import globals from "globals";
import pluginJs from "@eslint/js";
import jest from "eslint-plugin-jest";


export default [
  {
    rules: {
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
      "no-unused-vars": "error",
      "no-undef": "error",
      "no-console": "warn",
      "no-extra-semi": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-empty": "error",
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