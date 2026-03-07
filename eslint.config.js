const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const reactHooks = require("eslint-plugin-react-hooks");

module.exports = [
  ...nextCoreWebVitals,
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: reactHooks.configs.flat["recommended-latest"].rules,
  },
];
