import { page } from 'vitest/browser'
import { it, expect, describe, beforeAll } from 'vitest'

import ContextMenu from '../src/main'

describe('ContextMenu - Browser Tests', () => {
    beforeAll(() => {
        document.body.innerHTML = `
            <div id="test-container" style="width: 800px; height: 600px;">
                <div id="map" style="width: 100%; height: 100%;"></div>
            </div>
        `
    })

    describe('DOM Interactions', () => {
        it('should create container in the DOM', () => {
            const contextMenu = new ContextMenu({
                width: 200,
            })

            // @ts-expect-error - accessing protected property for testing
            const { container } = contextMenu

            expect(container).toBeDefined()
            expect(container instanceof HTMLElement).toBe(true)
            expect(container.tagName).toBe('DIV')
        })

        it('should apply correct CSS classes', () => {
            const contextMenu = new ContextMenu()

            // @ts-expect-error - accessing protected property for testing
            const { container } = contextMenu

            expect(container.classList.contains('ol-ctx-menu-container')).toBe(true)
            expect(container.classList.contains('ol-unselectable')).toBe(true)
            expect(container.classList.contains('ol-ctx-menu-hidden')).toBe(true)
        })

        it('should set width style correctly', () => {
            const customWidth = 250
            const contextMenu = new ContextMenu({
                width: customWidth,
            })

            // @ts-expect-error - accessing protected property for testing
            const { container } = contextMenu
            const computedWidth = container.style.width

            expect(computedWidth).toBe(`${customWidth}px`)
        })
    })

    describe('Menu Items Rendering', () => {
        it('should render menu items in the DOM', () => {
            const contextMenu = new ContextMenu({
                items: [
                    { callback: () => {}, text: 'Test Item 1' },
                    { callback: () => {}, text: 'Test Item 2' },
                ],
            })

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu
            const menuList = container.querySelector('ul')

            expect(menuList).toBeDefined()
            expect(menuList).not.toBeNull()
        })

        it('should create nested menu structure', () => {
            const contextMenu = new ContextMenu({
                items: [
                    {
                        items: [
                            { callback: () => {}, text: 'Child Item 1' },
                            { callback: () => {}, text: 'Child Item 2' },
                        ],
                        text: 'Parent Menu',
                    },
                ],
            })

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu

            expect(container).toBeDefined()
            expect(container.querySelector('ul')).not.toBeNull()
        })
    })

    describe('Visibility States', () => {
        it('should start hidden', () => {
            const contextMenu = new ContextMenu()

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu

            expect(contextMenu.isOpen()).toBe(false)
            expect(container.classList.contains('ol-ctx-menu-hidden')).toBe(true)
        })

        it('should toggle hidden class when closing', () => {
            const contextMenu = new ContextMenu()

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu

            container.classList.remove('ol-ctx-menu-hidden')
            expect(container.classList.contains('ol-ctx-menu-hidden')).toBe(false)

            contextMenu.closeMenu()
            expect(container.classList.contains('ol-ctx-menu-hidden')).toBe(true)
        })
    })

    describe('Options Configuration', () => {
        it('should accept and apply custom width', () => {
            const widths = [150, 200, 300, 400]

            widths.forEach((width) => {
                const contextMenu = new ContextMenu({ width })

                // @ts-expect-error - accessing protected property
                expect(contextMenu.container.style.width).toBe(`${width}px`)
                expect(contextMenu.options.width).toBe(width)
            })
        })

        it('should accept custom items', () => {
            const customItems = [
                { callback: () => {}, text: 'Custom Item 1' },
                { callback: () => {}, text: 'Custom Item 2' },
            ]

            const contextMenu = new ContextMenu({
                items: customItems,
            })

            expect(contextMenu.options.items).toEqual(customItems)
        })
    })

    describe('Element Queries with page API', () => {
        it('should find elements using page.getByRole', () => {
            document.body.innerHTML = `
                <div>
                    <button>Click Me</button>
                    <input type="text" placeholder="Username" />
                </div>
            `

            const button = page.getByRole('button', { name: /click me/i })

            expect(button).toBeDefined()
        })

        it('should query DOM elements', () => {
            document.body.innerHTML = `
                <div id="test-menu" class="menu">
                    <ul>
                        <li>Item 1</li>
                        <li>Item 2</li>
                    </ul>
                </div>
            `

            const menu = document.querySelector('#test-menu')
            const items = document.querySelectorAll('#test-menu li')

            expect(menu).not.toBeNull()
            expect(items.length).toBe(2)
        })
    })

    describe('Default Items', () => {
        it('should include default items when enabled', () => {
            const contextMenu = new ContextMenu({
                defaultItems: true,
            })

            const defaultItems = contextMenu.getDefaultItems()

            expect(Array.isArray(defaultItems)).toBe(true)
            expect(defaultItems.length).toBeGreaterThan(0)
        })

        it('should have zoom controls in default items', () => {
            const contextMenu = new ContextMenu({
                defaultItems: true,
            })

            const defaultItems = contextMenu.getDefaultItems()
            const texts = defaultItems.map((item) =>
                typeof item === 'string' ? item : item.text,
            )

            expect(texts.some((t) => t.includes('Zoom In'))).toBe(true)
            expect(texts.some((t) => t.includes('Zoom Out'))).toBe(true)
        })
    })
})
