module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["plugin:@typescript-eslint/recommended"],
  plugins: ["@typescript-eslint"],
  env: {
    browser: true,
    node: true
  },

  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module"
  },
  rules: {
    "@typescript-eslint/interface-name-prefix": [
      "warn",
      { prefixWithI: "always" }
    ],
    "prefer-const": "off"
  }
};
