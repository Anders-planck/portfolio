// The package ships no type declarations; this covers the part
// eslint.config.ts uses.
declare module 'eslint-plugin-jsx-a11y' {
  import type { ESLint, Linter } from 'eslint'

  const plugin: ESLint.Plugin & {
    flatConfigs: {
      recommended: Linter.Config & { rules: Linter.RulesRecord }
    }
  }
  export default plugin
}
