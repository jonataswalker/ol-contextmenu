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
    settings: {
        'import/resolver': {
            alias: {
                map: [['@', './src']],
                extensions: ['.ts'],
            },
        },
    },
    extends: ['jwalker/ts', 'jwalker', 'prettier'],
    rules: {
        'no-shadow': 'off',
        'no-magic-numbers': 'off',
        'no-unused-vars': 'off',
        'no-this-before-super': 'off',
        'unicorn/prevent-abbreviations': 'off',
        'unicorn/prefer-dom-node-append': 'off',
        'security/detect-object-injection': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    },
};
