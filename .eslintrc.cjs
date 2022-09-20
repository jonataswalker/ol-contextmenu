module.exports = {
    root: true,
    parserOptions: {
        parser: require.resolve('@typescript-eslint/parser'),
        project: ['./tsconfig.eslint.json'],
    },
    env: {
        browser: true,
        node: true,
    },
    extends: ['jwalker', 'jwalker/ts', 'prettier'],
    rules: {
        'no-shadow': 'off',
        'no-magic-numbers': 'off',
        'no-unused-vars': 'off',
        'no-this-before-super': 'off',
        'no-use-before-define': 'off',
        'class-methods-use-this': 'off',
        'import/no-unused-modules': 'off',
        'import/no-extraneous-dependencies': 'off',
        'unicorn/prevent-abbreviations': 'off',
        'unicorn/prefer-dom-node-append': 'off',
        'security/detect-object-injection': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
        '@typescript-eslint/no-use-before-define': [
            'error',
            { typedefs: false, ignoreTypeReferences: true },
        ],

        'import/extensions': [
            'error',
            {
                js: 'ignorePackages',
            },
        ],
    },
};
