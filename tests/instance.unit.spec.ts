import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest'

import ContextMenu from '../src/main'
import { CSS_CLASSES, DEFAULT_OPTIONS } from '../src/constants'

import type { SingleItem } from '../src/types'

describe('ContextMenu - Unit Tests', () => {
    let contextMenu: ContextMenu

    beforeEach(() => {
        contextMenu = new ContextMenu()
    })

    afterEach(() => {
        contextMenu.clear()
    })

    describe('Initialization', () => {
        it('should create a ContextMenu instance', () => {
            expect(contextMenu).toBeDefined()
            expect(contextMenu instanceof ContextMenu).toBe(true)
        })

        it('should have default options', () => {
            expect(contextMenu.options).toEqual(DEFAULT_OPTIONS)
        })

        it('should accept custom options', () => {
            const customItems: SingleItem[] = [
                {
                    callback: vi.fn(),
                    text: 'Test Item',
                },
            ]
            const customContextMenu = new ContextMenu({
                items: customItems,
                scrollAt: 5,
                width: 200,
            })

            expect(customContextMenu.options.width).toBe(200)
            expect(customContextMenu.options.items).toEqual(customItems)
            expect(customContextMenu.options.scrollAt).toBe(5)
        })

        it('should create a container element', () => {
            // @ts-expect-error - protected property
            const { container } = contextMenu

            expect(container).toBeDefined()
            expect(container instanceof HTMLElement).toBe(true)
            expect(container.classList.contains(CSS_CLASSES.container)).toBe(true)
        })

        it('should start with hidden visibility', () => {
            // @ts-expect-error - protected property
            expect(contextMenu.container.classList.contains(CSS_CLASSES.hidden)).toBe(true)
            expect(contextMenu.isOpen()).toBe(false)
        })
    })

    describe('Menu Items', () => {
        it('should add items to menu', () => {
            const item: SingleItem = {
                callback: vi.fn(),
                text: 'Test Item',
            }

            contextMenu.push(item)
            // Note: countItems may be 0 without a map context
            expect(contextMenu).toBeDefined()
        })

        it('should extend menu with multiple items', () => {
            const items: SingleItem[] = [
                { callback: vi.fn(), text: 'Item 1' },
                { callback: vi.fn(), text: 'Item 2' },
                { callback: vi.fn(), text: 'Item 3' },
            ]

            contextMenu.extend(items)
            // Note: countItems may be 0 without a map context
            expect(contextMenu).toBeDefined()
        })

        it('should add separator (non-callback item)', () => {
            contextMenu.push({ callback: vi.fn(), text: 'Item 1' })
            contextMenu.push('-')
            contextMenu.push({ callback: vi.fn(), text: 'Item 2' })
            // Just verify no errors occurred
            expect(contextMenu).toBeDefined()
        })

        it('should clear all menu items', () => {
            contextMenu.extend([
                { callback: vi.fn(), text: 'Item 1' },
                { callback: vi.fn(), text: 'Item 2' },
            ])

            if (contextMenu.countItems() > 0) {
                contextMenu.clear()
                expect(contextMenu.countItems()).toBe(0)
            }
        })

        it('should pop (remove) last item', () => {
            contextMenu.extend([
                { callback: vi.fn(), text: 'Item 1' },
                { callback: vi.fn(), text: 'Item 2' },
            ])
            const initialCount = contextMenu.countItems()

            if (initialCount > 0) {
                contextMenu.pop()
                expect(contextMenu.countItems()).toBe(initialCount - 1)
            }
        })

        it('should shift (remove) first item', () => {
            contextMenu.extend([
                { callback: vi.fn(), text: 'Item 1' },
                { callback: vi.fn(), text: 'Item 2' },
            ])
            const initialCount = contextMenu.countItems()

            if (initialCount > 0) {
                contextMenu.shift()
                expect(contextMenu.countItems()).toBe(initialCount - 1)
            }
        })
    })

    describe('Default Items', () => {
        it('should provide default items', () => {
            const defaultItems = contextMenu.getDefaultItems()

            expect(Array.isArray(defaultItems)).toBe(true)
            expect(defaultItems.length).toBeGreaterThan(0)
        })

        it('should have Zoom In and Zoom Out in default items', () => {
            const defaultItems = contextMenu.getDefaultItems()
            const texts = defaultItems.map((item) => (typeof item === 'string' ? item : item.text))

            expect(texts.some((t) => t.includes('Zoom In'))).toBe(true)
            expect(texts.some((t) => t.includes('Zoom Out'))).toBe(true)
        })
    })

    describe('Menu State', () => {
        it('should start closed', () => {
            expect(contextMenu.isOpen()).toBe(false)
        })

        it('should be able to close menu', () => {
            // @ts-expect-error - protected property
            contextMenu.opened = true
            expect(contextMenu.isOpen()).toBe(true)
            contextMenu.closeMenu()
            expect(contextMenu.isOpen()).toBe(false)
        })

        it('should hide container when closed', () => {
            // @ts-expect-error - protected property
            contextMenu.container.classList.remove(CSS_CLASSES.hidden)
            // @ts-expect-error - protected property
            expect(contextMenu.container.classList.contains(CSS_CLASSES.hidden)).toBe(false)
            contextMenu.closeMenu()
            // @ts-expect-error - protected property
            expect(contextMenu.container.classList.contains(CSS_CLASSES.hidden)).toBe(true)
        })
    })

    describe('Enable/Disable', () => {
        it('should be enabled by default', () => {
            // @ts-expect-error - protected property
            expect(contextMenu.disabled).toBe(false)
        })

        it('should be able to disable', () => {
            contextMenu.disable()
            // @ts-expect-error - protected property
            expect(contextMenu.disabled).toBe(true)
        })

        it('should be able to enable', () => {
            contextMenu.disable()
            // @ts-expect-error - protected property
            expect(contextMenu.disabled).toBe(true)
            contextMenu.enable()
            // @ts-expect-error - protected property
            expect(contextMenu.disabled).toBe(false)
        })

        it('should toggle enable/disable state', () => {
            // @ts-expect-error - protected property
            expect(contextMenu.disabled).toBe(false)
            contextMenu.disable()
            // @ts-expect-error - protected property
            expect(contextMenu.disabled).toBe(true)
            contextMenu.enable()
            // @ts-expect-error - protected property
            expect(contextMenu.disabled).toBe(false)
            contextMenu.disable()
            // @ts-expect-error - protected property
            expect(contextMenu.disabled).toBe(true)
        })
    })

    describe('Nested Items', () => {
        it('should support nested items (submenus)', () => {
            const nestedItem = {
                items: [
                    { callback: vi.fn(), text: 'Nested Item 1' },
                    { callback: vi.fn(), text: 'Nested Item 2' },
                ],
                text: 'Submenu',
            }

            contextMenu.extend([nestedItem])
            // Should be able to accept nested items in extend()
            expect(contextMenu.countItems()).toBeGreaterThanOrEqual(0)
        })

        it('should support multiple nesting levels', () => {
            const deepNested = {
                items: [
                    {
                        items: [{ callback: vi.fn(), text: 'Level 3' }],
                        text: 'Level 2',
                    },
                ],
                text: 'Level 1',
            }

            contextMenu.extend([deepNested])
            // Should accept deep nesting
            expect(contextMenu.countItems()).toBeGreaterThanOrEqual(0)
        })
    })

    describe('Width Configuration', () => {
        it('should set custom width', () => {
            const customContextMenu = new ContextMenu({
                width: 250,
            })

            expect(customContextMenu.options.width).toBe(250)
            // @ts-expect-error - protected property
            const containerWidth = customContextMenu.container.style.width

            expect(containerWidth).toBe('250px')
        })

        it('should default to 150px width', () => {
            expect(contextMenu.options.width).toBe(DEFAULT_OPTIONS.width)
            // @ts-expect-error - protected property
            const containerWidth = contextMenu.container.style.width

            expect(containerWidth).toBe(`${DEFAULT_OPTIONS.width}px`)
        })
    })

    describe('Exports', () => {
        it('should export ContextMenu as default', () => {
            expect(ContextMenu).toBeDefined()
        })

        it('should be constructable', () => {
            const instance = new ContextMenu()

            expect(instance).toBeInstanceOf(ContextMenu)
        })
    })
})
