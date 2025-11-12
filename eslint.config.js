import { node, jsonc, common, GLOB_TS, disabled, typescript, formatters, GLOB_TESTS } from 'eslint-config-jwalker'

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...common,
    ...node,
    ...typescript,
    ...jsonc,
    ...formatters,
    ...disabled,
    { ignores: ['examples/**/*'] },
    {
        rules: {},
    },
    {
        files: [GLOB_TS],
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',

            'no-duplicate-imports': 'off',
            'no-restricted-globals': 'off',
            'no-unused-vars': 'off',

            'unicorn/prefer-single-call': 'off',
        },
    },
    {
        files: Array.from(GLOB_TESTS),
        rules: {
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/prefer-ts-expect-error': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',

            'max-statements': 'off',
            'max-statements-per-line': 'off',
            'no-console': 'off',
            'no-empty-function': 'off',
            'no-undef': 'off',
        },
    },
]
