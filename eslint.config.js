import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import eslintConfigPrettier from "eslint-config-prettier"
import reactHooksPlugin from "eslint-plugin-react-hooks"

export default tseslint.config(
  eslint.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/*"],
    plugins: {
      // register the plugin under its short name
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      // enforce exhaustive deps on hooks
      "react-hooks/exhaustive-deps": "error",
      // if you want also the basic rules-of-hooks check:
      "react-hooks/rules-of-hooks": "error",
    },
  },
)
