export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        "scaffold",
        "tooling",
        "ui",
        "i18n",
        "shell",
        "api",
        "catalogue",
        "product",
        "cart",
        "a11y",
        "docs",
        "ci",
        "release",
      ],
    ],
    "header-max-length": [2, "always", 72],
  },
};
