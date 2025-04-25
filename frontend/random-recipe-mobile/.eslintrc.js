// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: true,
        jsxBracketSameLine: false,
        arrowParens: 'always',
        endOfLine: 'auto',
      },
      {
        usePrettierrc: false,
      },
    ],
  },
  ignorePatterns: ['/dist/*'],
}
