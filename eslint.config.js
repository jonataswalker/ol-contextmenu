import { node, jsonc, common, disabled, typescript, formatters, GLOB_TESTS } from 'eslint-config-jwalker'

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
        rules: {
            'no-duplicate-imports': 'off',
            'no-unused-vars': 'off',
            'no-useless-assignment': 'off',

            'unicorn/consistent-compound-words': 'warn',
            'unicorn/logical-assignment-operators': 'off',
            'unicorn/prefer-number-coercion': 'off',
        },
    },
    {
        files: GLOB_TESTS,
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

            'unicorn/prefer-single-call': 'off',
        },
    },
    {
        files: ['tests/browser/**/*.{test,spec}.ts', 'tests/**/*.browser.{test,spec}.ts'],
        rules: {
            'no-restricted-globals': 'off',
        },
    },
]
