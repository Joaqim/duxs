// @ts-check
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    files: ['**/*.[jt]s'],
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/semi': ['error', 'always'],
    },
  }
);
