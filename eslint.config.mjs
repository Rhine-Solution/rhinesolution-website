import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "public/**", "next-env.d.ts"],
  },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Next 16 enables the experimental React hooks v6 rules that flag
      // intentional patterns in this codebase (e.g. reading localStorage in
      // an effect before setting state, or keeping a "latest callback" ref).
      // These are deliberate; keep the previous behavior.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
];

export default eslintConfig;