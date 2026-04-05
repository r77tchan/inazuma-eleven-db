import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Allow using native <img> elements (project policy prefers <img>).
  {
    rules: {
      "@next/next/no-img-element": "off",
      "no-restricted-imports": [
        "warn",
        {
          paths: [
            {
              name: "next/image",
              message:
                "プロジェクト方針: next/Image の使用は警告されます。代わりに <img> を使用してください。",
            },
            {
              name: "next/legacy/image",
              message:
                "プロジェクト方針: next/legacy/Image の使用は警告されます。代わりに <img> を使用してください。",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "local-scripts/**",
    // Keep the archived app in the repository without linting its sources or build output.
    "old/**",
  ]),
]);

export default eslintConfig;
