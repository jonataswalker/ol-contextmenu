import { type OxlintConfig, defineConfig } from 'oxlint'
import { jwalker } from 'oxlint-config-jwalker'

const base = jwalker({ ignores: ['examples/**', 'dist/**'] })

const config: OxlintConfig = defineConfig({
    ...base,
    rules: {
        ...base.rules,
        'import/no-unassigned-import': ['error', { allow: ['**/*.scss', '**/*.css'] }],
        'no-duplicate-imports': 'off',
    },
    overrides: [
        ...(base.overrides ?? []),
        {
            files: ['types/**/*.d.cts'],
            rules: {
                'no-redeclare': 'off',
            },
        },
        {
            files: ['tests/**/*.ts'],
            rules: {
                'import/no-unassigned-import': 'off',
                'max-statements': 'off',
                'no-empty-function': 'off',
                'no-restricted-globals': 'off',
                'typescript/no-unsafe-type-assertion': 'off',
                'unicorn/consistent-function-scoping': 'off',
            },
        },
    ],
})

export default config
