import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

const typeCheckedConfigs = [
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
].map((config) => ({
  ...config,
  files: ["**/*.ts"],
}));

export default [
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/coverage/**", "**/.turbo/**", "docs/**"],
  },
  {
    ...eslint.configs.recommended,
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        console: "readonly",
        process: "readonly",
      },
      sourceType: "module",
    },
  },
  ...typeCheckedConfigs,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },
];
