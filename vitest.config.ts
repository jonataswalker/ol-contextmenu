import { defineConfig } from 'vitest/config'
import { webdriverio } from '@vitest/browser-webdriverio'

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    browser: {
                        enabled: true,
                        instances: [
                            { browser: 'chrome' },
                            { browser: 'firefox' },
                        ],
                        provider: webdriverio(),
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
    },
})
