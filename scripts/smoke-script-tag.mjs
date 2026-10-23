import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { remote } from 'webdriverio'

const page = pathToFileURL(path.join(process.cwd(), 'examples', 'contextmenu.html')).href

const browser = await remote({
    capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
            binary: process.env.CHROME_BIN ?? '/usr/bin/google-chrome-stable',
        },
        'wdio:chromedriverOptions': { binary: process.env.CHROMEDRIVER_BIN ?? '/usr/bin/chromedriver' },
    },
    logLevel: 'error',
})

try {
    await browser.url(page)
    await browser.waitUntil(() => browser.execute(() => document.querySelector('.ol-viewport') !== null), {
        timeout: 20_000,
    })

    const global = await browser.execute(() => ({
        hasDefault: 'default' in globalThis.ContextMenu,
        type: typeof globalThis.ContextMenu,
    }))

    await browser.execute(() => {
        const viewport = document.querySelector('.ol-viewport')
        const rect = viewport.getBoundingClientRect()

        viewport.dispatchEvent(
            new MouseEvent('contextmenu', {
                bubbles: true,
                button: 2,
                cancelable: true,
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2,
            }),
        )
    })
    await browser.waitUntil(
        () => browser.execute(() => document.querySelector('.ol-ctx-menu-container:not(.ol-ctx-menu-hidden) li') !== null),
        { timeout: 5_000 },
    )

    const items = await browser.execute(() => document.querySelectorAll('.ol-ctx-menu-container li').length)

    if (global.type !== 'function' || global.hasDefault) {
        throw new Error(`The ContextMenu global should be the class, got ${JSON.stringify(global)}`)
    }

    console.log(`script-tag demo: menu opened with ${items} items`)
} finally {
    await browser.deleteSession()
}
