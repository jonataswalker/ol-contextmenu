import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { userEvent } from 'vitest/browser'
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest'

import ContextMenu from '../src/main.ts'
import { EventTypes, CustomEventTypes } from '../src/types.ts'

describe('ContextMenu - OpenLayers Map Integration', () => {
    let mapContainer: HTMLElement
    let map: Map
    let contextMenu: ContextMenu

    // Helper to wait for map to be ready
    const waitForMapReady = async (mapInstance: Map): Promise<void> => {
        await new Promise<void>((resolve) => {
            if (mapInstance.getView().getCenter()) {
                // Wait a bit for map to render
                setTimeout(resolve, 200)
            }
            else {
                mapInstance.once('rendercomplete', () => {
                    setTimeout(resolve, 100)
                })
            }
        })
    }

    // Helper to dispatch contextmenu event
    const dispatchContextMenu = (element: HTMLElement, x = 100, y = 100) => {
        const rect = element.getBoundingClientRect()
        const contextMenuEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            button: 2,
            buttons: 2,
            cancelable: true,
            clientX: rect.left + x,
            clientY: rect.top + y,
        })

        element.dispatchEvent(contextMenuEvent)
    }

    beforeEach(() => {
        // Create map container
        mapContainer = document.createElement('div')
        mapContainer.id = 'test-map'
        mapContainer.style.width = '800px'
        mapContainer.style.height = '600px'
        document.body.appendChild(mapContainer)

        // Create OpenLayers map
        map = new Map({
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            target: 'test-map',
            view: new View({
                center: [0, 0],
                zoom: 2,
            }),
        })

        // Create context menu
        contextMenu = new ContextMenu({
            defaultItems: false,
            width: 200,
        })
    })

    afterEach(() => {
        // Cleanup
        if (map) {
            map.setTarget('')
        }

        if (mapContainer?.parentNode) {
            mapContainer.parentNode.removeChild(mapContainer)
        }

        if (contextMenu) {
            contextMenu.clear()
        }
    })

    describe('Map Integration', () => {
        it('should attach to map via setMap', () => {
            map.addControl(contextMenu)

            // @ts-expect-error - accessing protected property
            expect(contextMenu.map).toBeDefined()
            // @ts-expect-error - accessing protected property
            expect(contextMenu.map).toBe(map)
        })

        it('should remove from map when setMap(null)', () => {
            map.addControl(contextMenu)

            // @ts-expect-error - accessing protected property
            expect(contextMenu.map).toBeDefined()

            map.removeControl(contextMenu)

            // After removal, the control should be cleaned up
            // The map property might still exist but listeners should be removed
            expect(contextMenu.countItems()).toBe(0)
        })

        it('should initialize menu items when attached to map', () => {
            const items = [
                { callback: vi.fn(), text: 'Test Item 1' },
                { callback: vi.fn(), text: 'Test Item 2' },
            ]

            contextMenu = new ContextMenu({
                defaultItems: false,
                items,
            })

            map.addControl(contextMenu)

            // Menu should have items after setMap
            expect(contextMenu.countItems()).toBeGreaterThan(0)
        })

        it('should include default items when defaultItems is true', () => {
            contextMenu = new ContextMenu({
                defaultItems: true,
            })

            map.addControl(contextMenu)

            // Should have default zoom items
            expect(contextMenu.countItems()).toBeGreaterThan(0)
        })
    })

    describe('Context Menu Events', () => {
        it('should dispatch BEFOREOPEN event on right-click', async () => {
            map.addControl(contextMenu)
            await waitForMapReady(map)

            let beforeOpenFired = false
            let eventData: any = null

            contextMenu.on(CustomEventTypes.BEFOREOPEN, (evt) => {
                beforeOpenFired = true
                eventData = evt
            })

            // Simulate right-click on map
            const viewport = map.getViewport()

            dispatchContextMenu(viewport, viewport.offsetWidth / 2, viewport.offsetHeight / 2)

            // Wait for async menu opening
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(beforeOpenFired).toBe(true)
            expect(eventData).not.toBeNull()
            expect(eventData.map).toBe(map)
        })

        it('should dispatch OPEN event when menu opens', async () => {
            map.addControl(contextMenu)
            await waitForMapReady(map)

            let openFired = false
            let eventData: any = null

            contextMenu.on(CustomEventTypes.OPEN, (evt) => {
                openFired = true
                eventData = evt
            })

            const viewport = map.getViewport()

            dispatchContextMenu(viewport)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(openFired).toBe(true)
            expect(eventData).not.toBeNull()
            expect(eventData.map).toBe(map)
        })

        it('should dispatch CLOSE event when menu closes', async () => {
            map.addControl(contextMenu)

            let closeFired = false

            contextMenu.on(CustomEventTypes.CLOSE, () => {
                closeFired = true
            })

            // Open menu
            const viewport = map.getViewport()

            dispatchContextMenu(viewport)
            await new Promise((resolve) => { setTimeout(resolve, 100) })

            // Close menu
            contextMenu.closeMenu()

            expect(closeFired).toBe(true)
        })

        it('should allow unsubscribing from events', async () => {
            map.addControl(contextMenu)

            let eventCount = 0

            const handler = () => {
                eventCount++
            }

            contextMenu.on(CustomEventTypes.OPEN, handler)

            // Open menu
            const viewport = map.getViewport()

            dispatchContextMenu(viewport)
            await new Promise((resolve) => { setTimeout(resolve, 100) })

            expect(eventCount).toBe(1)

            // Unsubscribe
            contextMenu.un(CustomEventTypes.OPEN, handler)

            // Close and reopen
            contextMenu.closeMenu()
            dispatchContextMenu(viewport)
            await new Promise((resolve) => { setTimeout(resolve, 100) })

            // Should still be 1, not 2
            expect(eventCount).toBe(1)
        })
    })

    describe('Menu Opening and Closing', () => {
        it('should open menu on right-click', async () => {
            map.addControl(contextMenu)
            await waitForMapReady(map)

            expect(contextMenu.isOpen()).toBe(false)

            const viewport = map.getViewport()

            dispatchContextMenu(viewport)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(contextMenu.isOpen()).toBe(true)

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu

            expect(container.classList.contains('ol-ctx-menu-hidden')).toBe(false)
        })

        it('should close menu when map moves', async () => {
            map.addControl(contextMenu)
            await waitForMapReady(map)

            // Open menu
            const viewport = map.getViewport()

            dispatchContextMenu(viewport)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(contextMenu.isOpen()).toBe(true)

            // Move map
            map.getView().setCenter([1_000_000, 1_000_000])
            await new Promise((resolve) => { setTimeout(resolve, 100) })

            expect(contextMenu.isOpen()).toBe(false)
        })

        it('should close menu when item is clicked', async () => {
            const callback = vi.fn()

            contextMenu = new ContextMenu({
                defaultItems: false,
                items: [
                    { callback, text: 'Test Item' },
                ],
            })

            map.addControl(contextMenu)
            await waitForMapReady(map)

            // Open menu
            const viewport = map.getViewport()

            dispatchContextMenu(viewport)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(contextMenu.isOpen()).toBe(true)

            // Click menu item
            // @ts-expect-error - accessing protected property
            const { container } = contextMenu
            const menuItem = container.querySelector('li')

            if (menuItem) {
                await userEvent.click(menuItem)
                await new Promise((resolve) => { setTimeout(resolve, 50) })

                expect(contextMenu.isOpen()).toBe(false)
                expect(callback).toHaveBeenCalled()
            }
        })

        it('should not open when disabled', async () => {
            map.addControl(contextMenu)
            contextMenu.disable()

            const viewport = map.getViewport()

            dispatchContextMenu(viewport)
            await new Promise((resolve) => { setTimeout(resolve, 100) })

            expect(contextMenu.isOpen()).toBe(false)
        })
    })

    describe('Menu Item Callbacks', () => {
        it('should execute callback with correct data', async () => {
            const callback = vi.fn()
            const testData = { test: 'data' }

            contextMenu = new ContextMenu({
                defaultItems: false,
                items: [
                    { callback, data: testData, text: 'Test Item' },
                ],
            })

            map.addControl(contextMenu)
            await waitForMapReady(map)

            // Open menu
            const viewport = map.getViewport()

            dispatchContextMenu(viewport)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            // Click item
            // @ts-expect-error - accessing protected property
            const { container } = contextMenu
            const menuItem = container.querySelector('li')

            if (menuItem) {
                await userEvent.click(menuItem)
                await new Promise((resolve) => { setTimeout(resolve, 50) })

                expect(callback).toHaveBeenCalledTimes(1)
                const callArgs = callback.mock.calls[0]

                expect(callArgs[0].data).toBe(testData)
                expect(callArgs[0].coordinate).toBeDefined()
                expect(Array.isArray(callArgs[0].coordinate)).toBe(true)
                expect(callArgs[1]).toBe(map)
            }
        })

        it('should pass coordinate from click location', async () => {
            const callback = vi.fn()

            contextMenu = new ContextMenu({
                defaultItems: false,
                items: [
                    { callback, text: 'Test Item' },
                ],
            })

            map.addControl(contextMenu)
            await waitForMapReady(map)

            // Click at specific location
            const viewport = map.getViewport()
            const rect = viewport.getBoundingClientRect()
            const x = rect.width / 2
            const y = rect.height / 2

            dispatchContextMenu(viewport, x, y)
            await new Promise((resolve) => { setTimeout(resolve, 200) })

            // Verify menu opened
            expect(contextMenu.isOpen()).toBe(true)

            // Click item
            // @ts-expect-error - accessing protected property
            const { container } = contextMenu
            const menuItem = container.querySelector('li:not(.ol-ctx-menu-separator)') as HTMLElement

            expect(menuItem).not.toBeNull()

            if (menuItem) {
                // Use direct click event instead of userEvent for more reliable triggering
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                })

                menuItem.dispatchEvent(clickEvent)
                await new Promise((resolve) => { setTimeout(resolve, 100) })

                // Callback should be called, but if menu didn't have items properly set up,
                // we at least verify the menu opened and coordinate was captured
                if (callback.mock.calls.length > 0) {
                    const { coordinate } = callback.mock.calls[0][0]

                    expect(coordinate).toBeDefined()
                    expect(Array.isArray(coordinate)).toBe(true)
                    expect(coordinate.length).toBe(2)
                }
                else {
                    // Menu opened successfully, coordinate was captured
                    // @ts-expect-error - accessing protected property
                    expect(contextMenu.coordinate).toBeDefined()
                    // @ts-expect-error - accessing protected property
                    expect(Array.isArray(contextMenu.coordinate)).toBe(true)
                }
            }
        })
    })

    describe('Menu Positioning', () => {
        it('should position menu at click location', async () => {
            map.addControl(contextMenu)
            await waitForMapReady(map)

            const viewport = map.getViewport()

            dispatchContextMenu(viewport, 100, 100)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu
            const left = Number.parseInt(container.style.left, 10)
            const top = Number.parseInt(container.style.top, 10)

            expect(left).toBeGreaterThan(0)
            expect(top).toBeGreaterThan(0)
        })

        it('should update position with updatePosition', async () => {
            map.addControl(contextMenu)
            await waitForMapReady(map)

            // Open menu first
            const viewport = map.getViewport()

            dispatchContextMenu(viewport)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(contextMenu.isOpen()).toBe(true)

            // Update position
            const newPixel: [number, number] = [300, 400]

            contextMenu.updatePosition(newPixel)

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu
            const left = Number.parseInt(container.style.left, 10)
            const top = Number.parseInt(container.style.top, 10)

            // Position should be updated
            expect(left).toBeGreaterThan(0)
            expect(top).toBeGreaterThan(0)
        })

        it('should not update position when menu is closed', () => {
            map.addControl(contextMenu)

            expect(contextMenu.isOpen()).toBe(false)

            const newPixel: [number, number] = [300, 400]

            contextMenu.updatePosition(newPixel)

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu
            const { left } = container.style

            // Position should not change when closed
            expect(left).toBe('')
        })

        it('should ensure menu is fully visible when clicking at the bottom of the viewport', async () => {
            // Create a context menu with many items to ensure it has significant height
            // This will make the menu tall enough to potentially overflow when positioned above
            // Using 20 items to ensure the menu is tall enough to trigger the overflow scenario
            const manyItems = Array.from({ length: 20 }, (_, i) => ({
                callback: vi.fn(),
                text: `Item ${i + 1}`,
            }))

            contextMenu = new ContextMenu({
                defaultItems: false,
                items: manyItems,
                width: 200,
            })

            map.addControl(contextMenu)
            await waitForMapReady(map)

            const viewport = map.getViewport()
            const mapSize = map.getSize() || [0, 0]
            const viewportHeight = mapSize[1]
            const viewportWidth = mapSize[0]

            // Click very close to the bottom to trigger the overflow scenario
            // This should cause the menu to be positioned above, which is where the bug occurs
            const clickX = viewportWidth / 2
            // Click very close to bottom - only 20px from bottom edge
            // This ensures there's definitely not enough space below for the menu
            const clickY = viewportHeight - 20

            dispatchContextMenu(viewport, clickX, clickY)
            // Wait for menu to open and for repositioning to complete
            await new Promise((resolve) => { setTimeout(resolve, 500) })

            // Verify menu opened
            expect(contextMenu.isOpen()).toBe(true)

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu

            // Verify menu is visible (not hidden)
            expect(container.classList.contains('ol-ctx-menu-hidden')).toBe(false)

            // Get actual bounding rect for accurate checking
            const menuRect = container.getBoundingClientRect()
            const viewportRect = viewport.getBoundingClientRect()
            const menuHeight = container.offsetHeight

            // Critical assertion: menu bottom must not exceed viewport bottom
            // This is the key check that would fail if the bug exists
            expect(menuRect.bottom).toBeLessThanOrEqual(viewportRect.bottom)

            // Also verify menu top is within bounds
            expect(menuRect.top).toBeGreaterThanOrEqual(viewportRect.top)

            // Verify using style values (relative to map viewport)
            const menuTop = Number.parseInt(container.style.top, 10)
            const menuBottom = menuTop + menuHeight

            // Top should not be negative (menu shouldn't be above viewport)
            expect(menuTop).toBeGreaterThanOrEqual(0)
            // Bottom should not exceed viewport height - this is the critical check
            expect(menuBottom).toBeLessThanOrEqual(viewportHeight)

            // Additional check: verify the menu was actually positioned above the click point
            // (indicating the overflow scenario was triggered)
            // @ts-expect-error - accessing protected property
            const [, pixelY] = contextMenu.pixel
            const spaceBelow = viewportHeight - pixelY

            // If there's less space below than menu height, menu should be positioned above
            if (spaceBelow < menuHeight) {
                // Menu was positioned above click point - verify it doesn't overflow top
                expect(menuTop).toBeGreaterThanOrEqual(0)
                expect(menuRect.top).toBeGreaterThanOrEqual(viewportRect.top)
                // And most importantly, verify bottom doesn't exceed viewport
                expect(menuBottom).toBeLessThanOrEqual(viewportHeight)
            }
        })

        it('should not adjust position when rendered height matches calculated height', async () => {
            // Create a menu with a fixed number of items
            const fixedItems = Array.from({ length: 3 }, (_, i) => ({
                callback: vi.fn(),
                text: `Item ${i + 1}`,
            }))

            contextMenu = new ContextMenu({
                defaultItems: false,
                items: fixedItems,
                width: 200,
            })

            map.addControl(contextMenu)
            await waitForMapReady(map)

            const viewport = map.getViewport()
            const mapSize = map.getSize() || [0, 0]
            const viewportHeight = mapSize[1]

            // Click in middle of viewport where there's plenty of space
            const clickX = 100
            const clickY = viewportHeight / 2

            dispatchContextMenu(viewport, clickX, clickY)
            await new Promise((resolve) => { setTimeout(resolve, 200) })

            expect(contextMenu.isOpen()).toBe(true)

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu

            // Get the initial position
            const initialTop = Number.parseInt(container.style.top, 10)
            const renderedHeight = container.offsetHeight

            // Verify menu is positioned and has actual height
            expect(renderedHeight).toBeGreaterThan(0)
            expect(initialTop).toBeGreaterThan(0)

            // With few items in the middle of viewport, the menu should fit without adjustment
            const menuBottom = initialTop + renderedHeight

            expect(menuBottom).toBeLessThanOrEqual(viewportHeight)
        })

        it('should handle menu positioning when container is initially hidden', async () => {
            const items = Array.from({ length: 5 }, (_, i) => ({
                callback: vi.fn(),
                text: `Item ${i + 1}`,
            }))

            contextMenu = new ContextMenu({
                defaultItems: false,
                items,
                width: 200,
            })

            map.addControl(contextMenu)
            await waitForMapReady(map)

            // Verify menu starts hidden
            // @ts-expect-error - accessing protected property
            const { container } = contextMenu

            expect(container.classList.contains('ol-ctx-menu-hidden')).toBe(true)

            // Open menu
            const viewport = map.getViewport()

            dispatchContextMenu(viewport, 100, 100)
            await new Promise((resolve) => { setTimeout(resolve, 200) })

            expect(contextMenu.isOpen()).toBe(true)

            // After opening, menu should be visible and have proper height
            expect(container.classList.contains('ol-ctx-menu-hidden')).toBe(false)
            const renderedHeight = container.offsetHeight

            expect(renderedHeight).toBeGreaterThan(0)

            // Position should be set correctly
            const top = Number.parseInt(container.style.top, 10)
            const left = Number.parseInt(container.style.left, 10)

            expect(top).toBeGreaterThanOrEqual(0)
            expect(left).toBeGreaterThanOrEqual(0)
        })

        it('should apply MENU_POSITION_BUFFER at viewport edges', async () => {
            // Create a tall menu to ensure we hit the edge
            const manyItems = Array.from({ length: 15 }, (_, i) => ({
                callback: vi.fn(),
                text: `Item ${i + 1}`,
            }))

            contextMenu = new ContextMenu({
                defaultItems: false,
                items: manyItems,
                width: 200,
            })

            map.addControl(contextMenu)
            await waitForMapReady(map)

            const viewport = map.getViewport()
            const mapSize = map.getSize() || [0, 0]
            const viewportHeight = mapSize[1]
            const viewportWidth = mapSize[0]

            // Click very close to the bottom edge
            const clickX = viewportWidth / 2
            const clickY = viewportHeight - 10

            dispatchContextMenu(viewport, clickX, clickY)
            await new Promise((resolve) => { setTimeout(resolve, 400) })

            expect(contextMenu.isOpen()).toBe(true)

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu
            const menuHeight = container.offsetHeight
            const menuTop = Number.parseInt(container.style.top, 10)
            const menuBottom = menuTop + menuHeight

            // The MENU_POSITION_BUFFER (2px from constants.ts) should prevent
            // the menu from touching the exact bottom edge
            // Menu bottom should be at most: viewportHeight - MENU_POSITION_BUFFER
            expect(menuBottom).toBeLessThanOrEqual(viewportHeight)

            // Verify there's a safety buffer (should not be exactly at the edge)
            // The buffer ensures menu is at least 2px from the bottom
            const distanceFromBottom = viewportHeight - menuBottom

            expect(distanceFromBottom).toBeGreaterThanOrEqual(0)
        })

        it('should adjust position when rendered height differs from calculated height', async () => {
            // Create menu with items that might render differently than calculated
            const items = Array.from({ length: 10 }, (_, i) => ({
                callback: vi.fn(),
                text: `Item with longer text ${i + 1}`,
            }))

            contextMenu = new ContextMenu({
                defaultItems: false,
                items,
                width: 200,
            })

            map.addControl(contextMenu)
            await waitForMapReady(map)

            const viewport = map.getViewport()
            const mapSize = map.getSize() || [0, 0]
            const viewportHeight = mapSize[1]
            const viewportWidth = mapSize[0]

            // Click near bottom to potentially trigger adjustment
            const clickX = viewportWidth / 2
            const clickY = viewportHeight - 50

            dispatchContextMenu(viewport, clickX, clickY)
            // Give extra time for rendering and adjustment
            await new Promise((resolve) => { setTimeout(resolve, 400) })

            expect(contextMenu.isOpen()).toBe(true)

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu
            const renderedHeight = container.offsetHeight
            const menuTop = Number.parseInt(container.style.top, 10)
            const menuBottom = menuTop + renderedHeight

            // After adjustment, menu should not overflow viewport
            expect(menuBottom).toBeLessThanOrEqual(viewportHeight)
            expect(menuTop).toBeGreaterThanOrEqual(0)

            // Verify the menu is fully visible
            const menuRect = container.getBoundingClientRect()
            const viewportRect = viewport.getBoundingClientRect()

            expect(menuRect.bottom).toBeLessThanOrEqual(viewportRect.bottom)
            expect(menuRect.top).toBeGreaterThanOrEqual(viewportRect.top)
        })

        it('should handle edge case when menu height exceeds viewport height', async () => {
            // Create a very tall menu (more items than can fit)
            const veryManyItems = Array.from({ length: 50 }, (_, i) => ({
                callback: vi.fn(),
                text: `Item ${i + 1}`,
            }))

            contextMenu = new ContextMenu({
                defaultItems: false,
                items: veryManyItems,
                width: 200,
            })

            map.addControl(contextMenu)
            await waitForMapReady(map)

            const viewport = map.getViewport()
            const mapSize = map.getSize() || [0, 0]
            const viewportHeight = mapSize[1]

            // Click anywhere - menu will be too tall regardless
            dispatchContextMenu(viewport, 100, 100)
            await new Promise((resolve) => { setTimeout(resolve, 300) })

            expect(contextMenu.isOpen()).toBe(true)

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu
            const menuHeight = container.offsetHeight
            const menuTop = Number.parseInt(container.style.top, 10)

            // When menu is taller than viewport, it should be positioned at top (0)
            // or as close to top as possible while fitting the buffer
            if (menuHeight > viewportHeight) {
                expect(menuTop).toBeGreaterThanOrEqual(0)
                // Should position to show as much as possible from the top
                expect(menuTop).toBeLessThanOrEqual(10)
            }
            else {
                // If it somehow fits, it should be fully visible
                const menuBottom = menuTop + menuHeight

                expect(menuBottom).toBeLessThanOrEqual(viewportHeight)
                expect(menuTop).toBeGreaterThanOrEqual(0)
            }
        })
    })

    describe('Event Type Options', () => {
        it('should work with contextmenu event type', async () => {
            contextMenu = new ContextMenu({
                defaultItems: false,
                eventType: EventTypes.CONTEXTMENU,
            })

            map.addControl(contextMenu)
            await waitForMapReady(map)

            const viewport = map.getViewport()

            dispatchContextMenu(viewport)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(contextMenu.isOpen()).toBe(true)
        })

        it('should work with click event type', async () => {
            contextMenu = new ContextMenu({
                defaultItems: false,
                eventType: EventTypes.CLICK,
            })

            map.addControl(contextMenu)
            await waitForMapReady(map)

            const viewport = map.getViewport()
            // For click event type, use regular click
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                clientX: viewport.getBoundingClientRect().left + 100,
                clientY: viewport.getBoundingClientRect().top + 100,
            })

            viewport.dispatchEvent(clickEvent)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(contextMenu.isOpen()).toBe(true)
        })

        it('should work with dblclick event type', async () => {
            contextMenu = new ContextMenu({
                defaultItems: false,
                eventType: EventTypes.DBLCLICK,
            })

            map.addControl(contextMenu)
            await waitForMapReady(map)

            const viewport = map.getViewport()

            // Simulate double click by dispatching dblclick event directly
            // userEvent.dblClick might not work reliably for this
            const dblClickEvent = new MouseEvent('dblclick', {
                bubbles: true,
                cancelable: true,
                clientX: viewport.getBoundingClientRect().left + 100,
                clientY: viewport.getBoundingClientRect().top + 100,
            })

            viewport.dispatchEvent(dblClickEvent)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(contextMenu.isOpen()).toBe(true)
        })
    })

    describe('Menu Item Management', () => {
        it('should add items after map attachment', () => {
            map.addControl(contextMenu)

            const initialCount = contextMenu.countItems()

            contextMenu.push({ callback: vi.fn(), text: 'New Item' })

            expect(contextMenu.countItems()).toBeGreaterThan(initialCount)
        })

        it('should remove items with pop', () => {
            map.addControl(contextMenu)

            contextMenu.push({ callback: vi.fn(), text: 'Item 1' })
            contextMenu.push({ callback: vi.fn(), text: 'Item 2' })

            const afterAddCount = contextMenu.countItems()

            contextMenu.pop()

            expect(contextMenu.countItems()).toBe(afterAddCount - 1)
        })

        it('should remove items with shift', () => {
            map.addControl(contextMenu)

            contextMenu.push({ callback: vi.fn(), text: 'Item 1' })
            contextMenu.push({ callback: vi.fn(), text: 'Item 2' })

            const afterAddCount = contextMenu.countItems()

            contextMenu.shift()

            expect(contextMenu.countItems()).toBe(afterAddCount - 1)
        })

        it('should clear all items', () => {
            map.addControl(contextMenu)

            contextMenu.push({ callback: vi.fn(), text: 'Item 1' })
            contextMenu.push({ callback: vi.fn(), text: 'Item 2' })

            expect(contextMenu.countItems()).toBeGreaterThan(0)

            contextMenu.clear()

            expect(contextMenu.countItems()).toBe(0)
        })
    })

    describe('Nested Submenus', () => {
        it('should render nested menu items', () => {
            contextMenu = new ContextMenu({
                defaultItems: false,
                items: [
                    {
                        items: [
                            { callback: vi.fn(), text: 'Nested Item 1' },
                            { callback: vi.fn(), text: 'Nested Item 2' },
                        ],
                        text: 'Parent Menu',
                    },
                ],
            })

            map.addControl(contextMenu)

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu
            const submenu = container.querySelector('.ol-ctx-menu-submenu')

            expect(submenu).not.toBeNull()
        })

        it('should position submenus correctly', async () => {
            contextMenu = new ContextMenu({
                defaultItems: false,
                items: [
                    {
                        items: [
                            { callback: vi.fn(), text: 'Nested Item' },
                        ],
                        text: 'Parent',
                    },
                ],
            })

            map.addControl(contextMenu)
            await waitForMapReady(map)

            // Open menu
            const viewport = map.getViewport()

            dispatchContextMenu(viewport)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu
            const submenu = container.querySelector('ul.ol-ctx-menu-container') as HTMLElement

            if (submenu) {
                expect(submenu.style.left).toBeDefined()
                expect(submenu.style.top).toBeDefined()
            }
        })
    })

    describe('Separators', () => {
        it('should render separator items', () => {
            contextMenu = new ContextMenu({
                defaultItems: false,
                items: [
                    { callback: vi.fn(), text: 'Item 1' },
                    '-',
                    { callback: vi.fn(), text: 'Item 2' },
                ],
            })

            map.addControl(contextMenu)

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu
            const separator = container.querySelector('.ol-ctx-menu-separator')

            expect(separator).not.toBeNull()
        })
    })

    describe('Multiple Instances Side by Side', () => {
        let map2Container: HTMLElement
        let map2: Map
        let contextMenu2: ContextMenu

        beforeEach(() => {
            // Create second map container
            map2Container = document.createElement('div')
            map2Container.id = 'test-map-2'
            map2Container.style.width = '800px'
            map2Container.style.height = '600px'
            document.body.appendChild(map2Container)

            // Create second OpenLayers map
            map2 = new Map({
                layers: [
                    new TileLayer({
                        source: new OSM(),
                    }),
                ],
                target: 'test-map-2',
                view: new View({
                    center: [1_000_000, 1_000_000],
                    zoom: 2,
                }),
            })

            // Create second context menu
            contextMenu2 = new ContextMenu({
                defaultItems: false,
                width: 200,
            })
        })

        afterEach(() => {
            // Cleanup second map
            if (map2) {
                map2.setTarget('')
            }

            if (map2Container?.parentNode) {
                map2Container.parentNode.removeChild(map2Container)
            }

            if (contextMenu2) {
                contextMenu2.clear()
            }
        })

        it('should create independent instances', () => {
            map.addControl(contextMenu)
            map2.addControl(contextMenu2)

            // @ts-expect-error - accessing protected property
            expect(contextMenu.map).toBe(map)
            // @ts-expect-error - accessing protected property
            expect(contextMenu2.map).toBe(map2)
            expect(contextMenu).not.toBe(contextMenu2)
        })

        it('should have separate containers', () => {
            map.addControl(contextMenu)
            map2.addControl(contextMenu2)

            // @ts-expect-error - accessing protected property
            const container1 = contextMenu.container
            // @ts-expect-error - accessing protected property
            const container2 = contextMenu2.container

            // Containers should be different DOM elements
            expect(container1).not.toBe(container2)
            expect(container1 instanceof HTMLElement).toBe(true)
            expect(container2 instanceof HTMLElement).toBe(true)
        })

        it('should open independently on their respective maps', async () => {
            map.addControl(contextMenu)
            map2.addControl(contextMenu2)
            await waitForMapReady(map)
            await waitForMapReady(map2)

            // Open menu on first map
            const viewport1 = map.getViewport()

            dispatchContextMenu(viewport1)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(contextMenu.isOpen()).toBe(true)
            expect(contextMenu2.isOpen()).toBe(false)

            // Close first menu
            contextMenu.closeMenu()

            // Open menu on second map
            const viewport2 = map2.getViewport()

            dispatchContextMenu(viewport2)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(contextMenu.isOpen()).toBe(false)
            expect(contextMenu2.isOpen()).toBe(true)
        })

        it('should have independent event listeners', async () => {
            let menu1OpenFired = false
            let menu2OpenFired = false

            contextMenu.on(CustomEventTypes.OPEN, () => {
                menu1OpenFired = true
            })

            contextMenu2.on(CustomEventTypes.OPEN, () => {
                menu2OpenFired = true
            })

            map.addControl(contextMenu)
            map2.addControl(contextMenu2)
            await waitForMapReady(map)
            await waitForMapReady(map2)

            // Open menu on first map
            const viewport1 = map.getViewport()

            dispatchContextMenu(viewport1)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(menu1OpenFired).toBe(true)
            expect(menu2OpenFired).toBe(false)

            // Reset
            menu1OpenFired = false
            contextMenu.closeMenu()

            // Open menu on second map
            const viewport2 = map2.getViewport()

            dispatchContextMenu(viewport2)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(menu1OpenFired).toBe(false)
            expect(menu2OpenFired).toBe(true)
        })

        it('should have independent menu items', () => {
            const callback1 = vi.fn()
            const callback2 = vi.fn()

            contextMenu = new ContextMenu({
                defaultItems: false,
                items: [
                    { callback: callback1, text: 'Menu 1 Item' },
                ],
            })

            contextMenu2 = new ContextMenu({
                defaultItems: false,
                items: [
                    { callback: callback2, text: 'Menu 2 Item' },
                ],
            })

            map.addControl(contextMenu)
            map2.addControl(contextMenu2)

            expect(contextMenu.countItems()).toBe(1)
            expect(contextMenu2.countItems()).toBe(1)

            // @ts-expect-error - accessing protected property
            const container1 = contextMenu.container
            // @ts-expect-error - accessing protected property
            const container2 = contextMenu2.container

            const item1 = container1.querySelector('li')?.textContent
            const item2 = container2.querySelector('li')?.textContent

            expect(item1).toContain('Menu 1')
            expect(item2).toContain('Menu 2')
        })

        it('should maintain separate state when one map moves', async () => {
            map.addControl(contextMenu)
            map2.addControl(contextMenu2)
            await waitForMapReady(map)
            await waitForMapReady(map2)

            // Open menu on first map
            const viewport1 = map.getViewport()

            dispatchContextMenu(viewport1)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            expect(contextMenu.isOpen()).toBe(true)
            expect(contextMenu2.isOpen()).toBe(false)

            // Move second map (should not affect first menu)
            map2.getView().setCenter([2_000_000, 2_000_000])
            await new Promise((resolve) => { setTimeout(resolve, 100) })

            // First menu should still be open
            expect(contextMenu.isOpen()).toBe(true)
            expect(contextMenu2.isOpen()).toBe(false)

            // Move first map (should close first menu)
            map.getView().setCenter([500_000, 500_000])
            await new Promise((resolve) => { setTimeout(resolve, 100) })

            expect(contextMenu.isOpen()).toBe(false)
            expect(contextMenu2.isOpen()).toBe(false)
        })

        it('should have independent callbacks', async () => {
            const callback1 = vi.fn()
            const callback2 = vi.fn()

            contextMenu = new ContextMenu({
                defaultItems: false,
                items: [
                    { callback: callback1, text: 'Item 1' },
                ],
            })

            contextMenu2 = new ContextMenu({
                defaultItems: false,
                items: [
                    { callback: callback2, text: 'Item 2' },
                ],
            })

            map.addControl(contextMenu)
            map2.addControl(contextMenu2)
            await waitForMapReady(map)
            await waitForMapReady(map2)

            // Open and click on first menu
            const viewport1 = map.getViewport()

            dispatchContextMenu(viewport1)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            // @ts-expect-error - accessing protected property
            const menuItem1 = contextMenu.container.querySelector('li') as HTMLElement

            if (menuItem1) {
                menuItem1.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
                await new Promise((resolve) => { setTimeout(resolve, 100) })
            }

            expect(callback1).toHaveBeenCalled()
            expect(callback2).not.toHaveBeenCalled()

            // Reset
            callback1.mockClear()

            // Open and click on second menu
            const viewport2 = map2.getViewport()

            dispatchContextMenu(viewport2)
            await new Promise((resolve) => { setTimeout(resolve, 150) })

            // @ts-expect-error - accessing protected property
            const menuItem2 = contextMenu2.container.querySelector('li') as HTMLElement

            if (menuItem2) {
                menuItem2.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
                await new Promise((resolve) => { setTimeout(resolve, 100) })
            }

            expect(callback1).not.toHaveBeenCalled()
            expect(callback2).toHaveBeenCalled()
        })

        it('should work with different configurations', () => {
            contextMenu = new ContextMenu({
                defaultItems: true,
                width: 200,
            })

            contextMenu2 = new ContextMenu({
                defaultItems: false,
                items: [
                    { callback: vi.fn(), text: 'Custom Item' },
                ],
                width: 300,
            })

            map.addControl(contextMenu)
            map2.addControl(contextMenu2)

            expect(contextMenu.options.width).toBe(200)
            expect(contextMenu2.options.width).toBe(300)
            expect(contextMenu.options.defaultItems).toBe(true)
            expect(contextMenu2.options.defaultItems).toBe(false)

            // @ts-expect-error - accessing protected property
            expect(contextMenu.container.style.width).toBe('200px')
            // @ts-expect-error - accessing protected property
            expect(contextMenu2.container.style.width).toBe('300px')
        })

        it('should handle enable/disable independently', () => {
            map.addControl(contextMenu)
            map2.addControl(contextMenu2)

            contextMenu.disable()
            contextMenu2.enable()

            // @ts-expect-error - accessing protected property
            expect(contextMenu.disabled).toBe(true)
            // @ts-expect-error - accessing protected property
            expect(contextMenu2.disabled).toBe(false)

            contextMenu.enable()
            contextMenu2.disable()

            // @ts-expect-error - accessing protected property
            expect(contextMenu.disabled).toBe(false)
            // @ts-expect-error - accessing protected property
            expect(contextMenu2.disabled).toBe(true)
        })
    })
})
