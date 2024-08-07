import { common, jsonc, typescript, GLOB_TESTS } from 'eslint-config-jwalker'

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...common,
    ...jsonc,
    ...typescript,
    { ignores: ['tsconfig.json'] },
    {
        rules: {
            'no-undefined': 'off',
            'sort-imports': 'off',
            'max-statements': 'off',

            'import/extensions': 'off',

            '@typescript-eslint/no-non-null-assertion': 'off',
            "@typescript-eslint/consistent-type-imports": "error",

            'sonarjs/cognitive-complexity': 'off',
        },
    },
    {
        files: [...GLOB_TESTS, 'tests/*.ts', 'lib-testing/*.ts'],
        rules: {
            'no-undef': 'off',
            'no-console': 'off',

            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/prefer-ts-expect-error': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
        },
    },
    {
        files: ['**/*.d.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/consistent-type-definitions': 'off',
        },
    },
]
