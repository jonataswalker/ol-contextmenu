import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest'

import ContextMenu from '../src/main.ts'

import type { Item, SingleItem } from '../src/types.ts'

describe('GitHub Issues - Regression Tests', () => {
    let contextMenu: ContextMenu

    beforeEach(() => {
        contextMenu = new ContextMenu({
            defaultItems: false,
            width: 200,
        })
    })

    afterEach(() => {
        contextMenu.clear()
    })

    describe('Issue: Context Menu Remains Visible After Item Click', () => {
        it('should close context menu when closeMenu() is called', () => {
            // @ts-expect-error - private property
            contextMenu.opened = true
            expect(contextMenu.isOpen()).toBe(true)

            contextMenu.closeMenu()
            expect(contextMenu.isOpen()).toBe(false)
        })

        it('should handle menu state transitions correctly', () => {
            expect(contextMenu.isOpen()).toBe(false)

            // @ts-expect-error - private property
            contextMenu.opened = true
            expect(contextMenu.isOpen()).toBe(true)

            contextMenu.closeMenu()
            expect(contextMenu.isOpen()).toBe(false)
        })
    })

    describe('Issue: Console Errors on contextmenu.close()', () => {
        it('should close context menu without errors', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

            // @ts-expect-error - private property
            contextMenu.opened = true
            contextMenu.closeMenu()

            expect(contextMenu.isOpen()).toBe(false)
            expect(consoleSpy).not.toHaveBeenCalled()

            consoleSpy.mockRestore()
        })

        it('should handle close() when menu is already closed', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

            contextMenu.closeMenu()
            expect(contextMenu.isOpen()).toBe(false)
            expect(consoleSpy).not.toHaveBeenCalled()

            consoleSpy.mockRestore()
        })

        it('should handle multiple close() calls without errors', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

            contextMenu.closeMenu()
            contextMenu.closeMenu()
            contextMenu.closeMenu()

            expect(contextMenu.isOpen()).toBe(false)
            expect(consoleSpy).not.toHaveBeenCalled()

            consoleSpy.mockRestore()
        })
    })

    describe('Issue: Font Awesome Icons Support', () => {
        it('should accept items with icon URLs', () => {
            const iconUrl = 'https://example.com/icon.svg'
            const items: SingleItem[] = [
                {
                    callback: vi.fn(),
                    icon: iconUrl,
                    text: 'Item with Icon',
                },
            ]

            // Should not throw when extending with icon items
            expect(() => { contextMenu.extend(items) }).not.toThrow()
        })

        it('should accept items with Font Awesome class names', () => {
            const faIconClass = 'fa fa-star'
            const items: SingleItem[] = [
                {
                    callback: vi.fn(),
                    icon: faIconClass,
                    text: 'Favorite',
                },
            ]

            // Should not throw when extending with FA class items
            expect(() => { contextMenu.extend(items) }).not.toThrow()
        })

        it('should support mixed icon types in same menu', () => {
            const items: SingleItem[] = [
                {
                    callback: vi.fn(),
                    icon: 'https://example.com/icon1.svg',
                    text: 'URL Icon',
                },
                {
                    callback: vi.fn(),
                    icon: 'fa fa-heart',
                    text: 'FontAwesome Icon',
                },
                {
                    callback: vi.fn(),
                    text: 'No Icon',
                },
            ]

            // Should not throw with mixed icon types
            expect(() => { contextMenu.extend(items) }).not.toThrow()
        })
    })

    describe('Issue: OpenLayers 9 Compatibility', () => {
        it('should initialize without OpenLayers version errors', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

            const testMenu = new ContextMenu({
                defaultItems: true,
                width: 200,
            })

            expect(testMenu).toBeDefined()
            expect(consoleSpy).not.toHaveBeenCalled()

            consoleSpy.mockRestore()
            testMenu.clear()
        })

        it('should support standard menu operations', () => {
            const items: SingleItem[] = [
                {
                    callback: vi.fn(),
                    text: 'Test',
                },
            ]

            contextMenu.extend(items)
            // @ts-expect-error - private property
            contextMenu.opened = true

            expect(contextMenu.isOpen()).toBe(true)

            contextMenu.closeMenu()
            expect(contextMenu.isOpen()).toBe(false)
        })

        it('should handle nested items without errors', () => {
            const items: Item[] = [
                {
                    items: [
                        {
                            callback: vi.fn(),
                            text: 'Child Item 1',
                        },
                        {
                            callback: vi.fn(),
                            text: 'Child Item 2',
                        },
                    ],
                    text: 'Parent Item',
                },
            ]

            // Should not throw with nested items
            expect(() => { contextMenu.extend(items) }).not.toThrow()
        })

        it('should maintain menu state across multiple open/close cycles', () => {
            contextMenu.extend([
                {
                    callback: vi.fn(),
                    text: 'Persistent Item',
                },
            ])

            for (let i = 0; i < 3; i++) {
                // @ts-expect-error - private property
                contextMenu.opened = true
                expect(contextMenu.isOpen()).toBe(true)
                contextMenu.closeMenu()
                expect(contextMenu.isOpen()).toBe(false)
            }
        })
    })

    describe('Additional Regression Tests', () => {
        it('should properly clear menu', () => {
            contextMenu.extend([
                {
                    callback: vi.fn(),
                    text: 'Item',
                },
            ])

            contextMenu.clear()
            expect(contextMenu).toBeDefined()
        })

        it('should handle empty menu gracefully', () => {
            contextMenu.clear()
            expect(contextMenu.isOpen()).toBe(false)
            contextMenu.closeMenu()
            expect(contextMenu.isOpen()).toBe(false)
        })

        it('should support push operations', () => {
            const item1: SingleItem = { callback: vi.fn(), text: 'Item 1' }
            const item2: SingleItem = { callback: vi.fn(), text: 'Item 2' }

            expect(() => { contextMenu.push(item1) }).not.toThrow()
            expect(() => { contextMenu.push(item2) }).not.toThrow()
        })

        it('should support extend operation', () => {
            expect(() => {
                contextMenu.extend([
                    { callback: vi.fn(), text: 'Item A' },
                    { callback: vi.fn(), text: 'Item B' },
                ])
            }).not.toThrow()
        })

        it('should support shift and pop operations', () => {
            contextMenu.extend([
                { callback: vi.fn(), text: 'First' },
                { callback: vi.fn(), text: 'Second' },
            ])

            expect(() => { contextMenu.shift() }).not.toThrow()
            expect(() => { contextMenu.pop() }).not.toThrow()
        })

        it('should handle disable/enable operations', () => {
            // @ts-expect-error - private property
            expect(contextMenu.disabled).toBe(false)

            contextMenu.disable()
            // @ts-expect-error - private property
            expect(contextMenu.disabled).toBe(true)

            contextMenu.enable()
            // @ts-expect-error - private property
            expect(contextMenu.disabled).toBe(false)
        })

        it('should provide default items', () => {
            const defaultMenu = new ContextMenu({
                defaultItems: true,
            })

            const defaults = defaultMenu.getDefaultItems()

            expect(Array.isArray(defaults)).toBe(true)
            expect(defaults.length).toBeGreaterThan(0)

            defaultMenu.clear()
        })
    })
})
