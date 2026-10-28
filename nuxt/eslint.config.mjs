// @ts-check
// Internal imports
import withNuxt from './.nuxt/eslint.config.mjs';

// Exports
export default withNuxt({
  rules: {
    // Services, utils and validators are static-only classes by project convention.
    '@typescript-eslint/no-extraneous-class': 'off',
    // Prettier writes void elements self-closed.
    'vue/html-self-closing': ['warn', { html: { void: 'any' } }],
  },
});
