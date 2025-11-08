import { defineConfig } from 'vitest/config'
import { webdriverio } from '@vitest/browser-webdriverio'

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            // https://vitest.dev/guide/browser/webdriverio
            instances: [
                { browser: 'chrome' },
                { browser: 'firefox' },
            ],
            provider: webdriverio(),
        },
    },
})
