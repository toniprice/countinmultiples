import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    ignores: [
      "build/**",
      "dist/**",
      "coverage/**",
    ],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
];
