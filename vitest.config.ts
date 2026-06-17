import { defineConfig } from 'vitest/config'
import { webdriverio } from '@vitest/browser-webdriverio'

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    browser: {
                        connectTimeout: 120_000,
                        enabled: true,
                        instances: [
                            { browser: 'chrome' },
                            { browser: 'firefox' },
                        ],
                        provider: webdriverio({
                            cacheDir: '.wdio-cache',
                            capabilities: {
                                'goog:chromeOptions': {
                                    args: ['--no-sandbox', '--disable-dev-shm-usage'],
                                },
                            },
                        }),
                    },
                    include: [
                        'tests/browser/**/*.{test,spec}.ts',
                        'tests/**/*.browser.{test,spec}.ts',
                    ],
                    name: 'browser',
                },
            },
            {
                test: {
                    environment: 'jsdom',
                    include: [
                        'tests/unit/**/*.{test,spec}.ts',
                        'tests/**/*.unit.{test,spec}.ts',
                    ],
                    name: 'unit',
                },
            },
        ],
        setupFiles: ['./tests/setup.ts'],
    },
})
