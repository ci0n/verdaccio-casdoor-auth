import tslint from 'typescript-eslint';
import eslint from '@eslint/js';
import pretterConfig from 'eslint-config-prettier';
import pretterPlugin from 'eslint-plugin-prettier/recommended';

export default tslint.config(
  eslint.configs.recommended,
  tslint.configs.eslintRecommended,
  ...tslint.configs.recommended,
  pretterConfig,
  {
    name: 'prettier',
    ...pretterPlugin,
    ignores: ['node_modules', 'lib/', ...pretterPlugin.ignores]
  },
  {
    name: 'custom',
    ignores: ['node_modules', 'lib/'],
    rules: {
      '@typescript-eslint/ban-types': 'off'
    }
  }
);
