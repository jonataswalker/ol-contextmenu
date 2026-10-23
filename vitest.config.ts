import process from 'node:process'

import { defineConfig } from 'vitest/config'
import { webdriverio } from '@vitest/browser-webdriverio'

const chromeBinary = process.env.CHROME_BIN ?? '/usr/bin/google-chrome-stable'
const chromedriverBinary = process.env.CHROMEDRIVER_BIN ?? '/usr/bin/chromedriver'
const firefoxBinary = process.env.FIREFOX_BIN ?? '/usr/bin/firefox'

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    browser: {
                        connectTimeout: 120_000,
                        enabled: true,
                        headless: true,
                        instances: [
                            { browser: 'chrome' },
                            { browser: 'firefox' },
                        ],
                        provider: webdriverio({
                            capabilities: {
                                'goog:chromeOptions': {
                                    args: ['--no-sandbox', '--disable-dev-shm-usage'],
                                    binary: chromeBinary,
                                },
                                'moz:firefoxOptions': {
                                    binary: firefoxBinary,
                                },
                                'wdio:chromedriverOptions': {
                                    binary: chromedriverBinary,
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
