import { readFileSync } from 'fs';

const swcConfig = JSON.parse(readFileSync('./.swcrc', 'utf8'));

/** @type {import('jest').Config} */
const config = {
    verbose: true,
    moduleFileExtensions: ['js', 'json', 'ts'],
    extensionsToTreatAsEsm: ['.ts'],
    transformIgnorePatterns: [],
    rootDir: '.',
    testMatch: ['**/?(*.)+(spec).ts'],
    // modulePathIgnorePatterns: ['<rootDir>/dist'],
    moduleNameMapper: {
        '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
    },
    transform: {
        '^.+\\.(t|j)s$': ['@swc/jest', { ...swcConfig }],
    },
    collectCoverage: true,
    // coverageThreshold: {
    //     global: {
    //         branches: 50,
    //         functions: 20,
    //         lines: 60,
    //         statements: 60,
    //     },
    // },
    // collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/**/*.module.(t|j)s'],
    // coveragePathIgnorePatterns: [
    //     'node_modules',
    //     'dist',
    //     'test-config',
    //     'interfaces',
    //     'jestGlobalMocks.ts',
    //     '.module.ts',
    //     '<rootDir>/src/main.ts',
    //     '.mock.ts',
    //     '.spec.ts',
    // ],
    // coverageDirectory: './coverage/unit',
    // coverageReporters: ['json'],
    testEnvironment: 'jsdom',
};

export default config;
