// describe('ContextMenu E2E Tests with Vitest', () => {
//     let browser: Browser
//     let page: Page

//     beforeAll(async () => {
//         browser = await puppeteer.launch({
//             headless: true,
//             args: ['--no-sandbox', '--disable-setuid-sandbox'],
//         })
//         page = await browser.newPage()
//         page.setDefaultNavigationTimeout(30000)
//     })

//     afterAll(async () => {
//         await page.close()
//         await browser.close()
//     })

//     it('should load the demo page with two maps', async () => {
//         const response = await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })

//         expect(response?.ok()).toBe(true)

//         const map1 = await page.$('[id="map1"]')
//         const map2 = await page.$('[id="map2"]')

//         expect(map1).toBeTruthy()
//         expect(map2).toBeTruthy()
//     })

// it('should have OpenLayers library loaded', async () => {
//     await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })

//     const hasOL = await page.evaluate(() => {
//         return (globalThis as any).ol !== undefined
//     })

//     expect(hasOL).toBe(true)
// })

// it('should have stylesheets loaded', async () => {
//     await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })

//     const stylesheetCount = await page.evaluate(() => {
//         return document.styleSheets.length
//     })

//     expect(stylesheetCount).toBeGreaterThan(0)
// })

// it('should have correct page title', async () => {
//     await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })

//     const title = await page.title()

//     expect(title).toContain('Context Menu')
// })

// it('should have no critical console errors on page load', async () => {
//     const errors: string[] = []

//     page.on('console', (msg) => {
//         if (msg.type() === 'error') {
//             errors.push(msg.text())
//         }
//     })

//     await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })
//     await new Promise((resolve) => setTimeout(resolve, 500))

//     // Allow minor errors but not critical ones
//     const criticalErrors = errors.filter(
//         (err) => !err.includes('ResizeObserver') && !err.includes('favicon') && !err.includes('404'),
//     )

//     expect(criticalErrors.length).toBe(0)
// })

// it('should render main container with both maps', async () => {
//     await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })

//     const mainContainer = await page.$('.main-container')

//     expect(mainContainer).toBeTruthy()

//     const mapContainers = await page.$$('[id^="map"]')

//     expect(mapContainers.length).toBeGreaterThanOrEqual(2)
// })

// it('should have proper HTML structure', async () => {
//     await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })

//     const htmlValid = await page.evaluate(() => {
//         return (
//             document.documentElement.lang === 'en'
//             && document.head.querySelector('meta[charset]') !== null
//             && document.head.querySelector('meta[name="viewport"]') !== null
//         )
//     })

//     expect(htmlValid).toBe(true)
// })

// it('should have independent ContextMenu instances for each map', async () => {
//     await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })
//     await new Promise((resolve) => setTimeout(resolve, 1000))

//     const menuInstances = await page.evaluate(() => {
//         // Get context menu instances from the exposed testMaps object
//         const { testMaps } = globalThis as any

//         if (!testMaps) return { areUnique: false, count: 0, hasContextMenu1: false, hasContextMenu2: false }

//         const { contextmenu, contextmenu2 } = testMaps

//         return {
//             areUnique: contextmenu !== contextmenu2,
//             count: 2,
//             hasContextMenu1: Boolean(contextmenu),
//             hasContextMenu2: Boolean(contextmenu2),
//         }
//     })

//     expect(menuInstances.count).toEqual(2)
//     expect(menuInstances.hasContextMenu1).toBe(true)
//     expect(menuInstances.hasContextMenu2).toBe(true)
//     expect(menuInstances.areUnique).toBe(true)
// })

// it('should maintain separate state for each map instance', async () => {
//     await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })
//     await new Promise((resolve) => setTimeout(resolve, 1000))

//     const mapStates = await page.evaluate(() => {
//         const { testMaps } = globalThis as any

//         if (!testMaps) return { mapsAreUnique: false, mapsCount: 0, valid: false }

//         const { map, map2 } = testMaps

//         return {
//             map1HasTarget: map?.getTarget() === 'map1',
//             map2HasTarget: map2?.getTarget() === 'map2',
//             mapsAreUnique: map !== map2,
//             mapsCount: 2,
//             valid: Boolean(map) && Boolean(map2),
//         }
//     })

//     expect(mapStates.valid).toBe(true)
//     expect(mapStates.mapsCount).toEqual(2)
//     expect(mapStates.mapsAreUnique).toBe(true)
//     expect(mapStates.map1HasTarget).toBe(true)
//     expect(mapStates.map2HasTarget).toBe(true)
// })

// it('should respond to navigation correctly', async () => {
//     const response = await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })

//     expect(response?.status()).toBeLessThan(400)
// })
// })
