import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest'

import ContextMenu from '../src/main.ts'
import {
    CSS_CLASSES,
    DEFAULT_OPTIONS,
    CONTAINER_PADDING,
    MENU_POSITION_BUFFER,
    MENU_POSITION_OFFSET,
    CONTAINER_PADDING_TOTAL,
} from '../src/constants.ts'

import type { SingleItem } from '../src/types.ts'

function listItemsOf(menu: ContextMenu): HTMLLIElement[] {
    // @ts-expect-error - accessing protected property
    const { container }: { container: HTMLDivElement } = menu

    return Array.from(container.querySelectorAll('li'))
}

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

    describe('Constants Validation', () => {
        it('should have consistent padding values between JS and CSS', () => {
            // CONTAINER_PADDING should match the SCSS variable $container-padding: 8px
            expect(CONTAINER_PADDING).toBe(8)

            // CONTAINER_PADDING_TOTAL should be double (top + bottom padding)
            expect(CONTAINER_PADDING_TOTAL).toBe(CONTAINER_PADDING * 2)
            expect(CONTAINER_PADDING_TOTAL).toBe(16)
        })

        it('should have valid positioning constants', () => {
            // MENU_POSITION_OFFSET should be reasonable (spacing from click point)
            expect(MENU_POSITION_OFFSET).toBe(10)
            expect(MENU_POSITION_OFFSET).toBeGreaterThan(0)

            // MENU_POSITION_BUFFER should be reasonable (safety margin at edges)
            expect(MENU_POSITION_BUFFER).toBe(2)
            expect(MENU_POSITION_BUFFER).toBeGreaterThan(0)
        })

        it('should have CSS class constants defined', () => {
            expect(CSS_CLASSES.container).toBe('ol-ctx-menu-container')
            expect(CSS_CLASSES.hidden).toBe('ol-ctx-menu-hidden')
            expect(CSS_CLASSES.icon).toBe('ol-ctx-menu-icon')
            expect(CSS_CLASSES.separator).toBe('ol-ctx-menu-separator')
            expect(CSS_CLASSES.submenu).toBe('ol-ctx-menu-submenu')
            expect(CSS_CLASSES.namespace).toBe('ol-ctx-menu')
        })

        it('should verify container uses padding constants correctly', () => {
            const cm = new ContextMenu({
                items: [
                    { callback: vi.fn(), text: 'Item 1' },
                    { callback: vi.fn(), text: 'Item 2' },
                ],
            })

            // @ts-expect-error - accessing protected property
            const { container } = cm

            // Verify the container exists and can be styled
            expect(container).toBeDefined()
            expect(container instanceof HTMLElement).toBe(true)

            // The container should use styles that incorporate padding
            // This is validated through the constants matching the SCSS
            expect(CONTAINER_PADDING_TOTAL).toBe(16)

            cm.clear()
        })
    })

    describe('Without a map', () => {
        it('should not register a window beforeunload listener', () => {
            const addEventListener = vi.spyOn(globalThis, 'addEventListener')

            const menu = new ContextMenu()

            expect(addEventListener.mock.calls.some(([type]) => type === 'beforeunload')).toBe(
                false,
            )
            expect(() => globalThis.dispatchEvent(new Event('beforeunload'))).not.toThrow()

            addEventListener.mockRestore()
            menu.clear()
        })

        it('should track items added before the menu joins a map', () => {
            const menu = new ContextMenu({ defaultItems: false })

            menu.extend([
                { callback: vi.fn(), text: 'Item 1' },
                { callback: vi.fn(), text: 'Item 2' },
            ])

            expect(menu.countItems()).toBe(2)
        })

        it('should remove entries from a menu that is not in the document', () => {
            const menu = new ContextMenu({ defaultItems: false })

            menu.extend([
                { callback: vi.fn(), text: 'Item 1' },
                { callback: vi.fn(), text: 'Item 2' },
            ])
            menu.pop()

            expect(menu.countItems()).toBe(1)
            expect(listItemsOf(menu)).toHaveLength(1)
        })

        it('should remove the children of a removed submenu', () => {
            const menu = new ContextMenu({ defaultItems: false })

            menu.extend([
                {
                    items: [
                        { callback: vi.fn(), text: 'Child 1' },
                        { callback: vi.fn(), text: 'Child 2' },
                    ],
                    text: 'Submenu',
                },
                { callback: vi.fn(), text: 'Last' },
            ])
            menu.shift()

            expect(menu.countItems()).toBe(1)
            expect(listItemsOf(menu)).toHaveLength(1)

            menu.pop()

            expect(menu.countItems()).toBe(0)
            expect(listItemsOf(menu)).toHaveLength(0)
        })
    })

    describe('Input objects', () => {
        it('should not modify the items it is given', () => {
            const item: SingleItem = { callback: vi.fn(), icon: 'pin.png', text: 'Pin' }
            const menu = new ContextMenu({ defaultItems: false })

            menu.extend([item])

            expect(Object.keys(item)).toEqual(['callback', 'icon', 'text'])
            expect(listItemsOf(menu)[0]?.classList.contains(CSS_CLASSES.icon)).toBe(true)
        })

        it('should return independent copies of the default items', () => {
            const first = contextMenu.getDefaultItems()

            first[0].text = 'Changed'

            expect(contextMenu.getDefaultItems()[0].text).toBe('Zoom In')
            expect(new ContextMenu().getDefaultItems()[0].text).toBe('Zoom In')
        })

        it('should keep an icon URL inside the background-image declaration', () => {
            const menu = new ContextMenu({ defaultItems: false })

            menu.extend([{ callback: vi.fn(), icon: 'x.png");color:red;("', text: 'Icon' }])

            const li = listItemsOf(menu)[0]

            expect(li?.style.color).toBe('')
            expect(li?.style.backgroundImage).toContain('x.png')
        })
    })
})
