/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-prettier/skip-formatting",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  env: { browser: true, es2020: true, es2022: true },
  overrides: [
    {
      files: ["**/*.cjs"],
      env: {
        node: true,
      },
    },
  ],
  rules: {
    "vue/multi-word-component-names": "off",
  },
};
