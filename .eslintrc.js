// Colors must come from the theme (src/constants/designSystem.js via useTheme()),
// so a hex or rgb()/rgba() literal anywhere else is a lint error.
const HARDCODED_COLOR =
  '/^\\s*(#[0-9a-fA-F]{3,8}|rgba?\\([^)]*\\))\\s*$/';

module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['src/**/*.js', 'App.js'],
      excludedFiles: ['src/constants/designSystem.js'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: `Literal[value=${HARDCODED_COLOR}]`,
            message:
              'Hardcoded color. Use a theme token from useTheme().colors (defined in src/constants/designSystem.js).',
          },
          {
            selector: `TemplateElement[value.raw=${HARDCODED_COLOR}]`,
            message:
              'Hardcoded color. Use a theme token from useTheme().colors (defined in src/constants/designSystem.js).',
          },
        ],
      },
    },
  ],
};
