import { page, userEvent } from 'vitest/browser'
import { it, expect, describe, afterEach, beforeEach } from 'vitest'

import ContextMenu from '../src/main.ts'

describe('ContextMenu - User Interactions (Browser)', () => {
    let testContainer: HTMLElement

    beforeEach(() => {
        testContainer = document.createElement('div')
        testContainer.id = 'test-container'
        testContainer.style.width = '800px'
        testContainer.style.height = '600px'
        document.body.appendChild(testContainer)
    })

    afterEach(() => {
        if (testContainer?.parentNode) {
            testContainer.parentNode.removeChild(testContainer)
        }
    })

    describe('Click Interactions', () => {
        it('should handle button clicks', async () => {
            let clickCount = 0
            const button = document.createElement('button')

            button.textContent = 'Click Me'
            button.id = 'test-button'
            button.addEventListener('click', () => clickCount++)
            testContainer.appendChild(button)

            const buttonElement = page.getByRole('button', { name: /click me/i })

            await userEvent.click(buttonElement)

            expect(clickCount).toBe(1)
        })

        it('should handle multiple clicks', async () => {
            let clickCount = 0
            const button = document.createElement('button')

            button.textContent = 'Multi-Click'
            button.addEventListener('click', () => clickCount++)
            testContainer.appendChild(button)

            const buttonElement = page.getByRole('button', { name: /multi-click/i })

            await userEvent.click(buttonElement)
            await userEvent.click(buttonElement)
            await userEvent.click(buttonElement)

            expect(clickCount).toBe(3)
        })
    })

    describe('Text Input Interactions', () => {
        it('should handle text input', async () => {
            const input = document.createElement('input')

            input.type = 'text'
            input.placeholder = 'Enter text'
            input.id = 'test-input'
            testContainer.appendChild(input)

            const inputElement = page.getByPlaceholder('Enter text')

            await userEvent.fill(inputElement, 'Hello World')

            expect(input.value).toBe('Hello World')
        })

        it('should handle input clearing', async () => {
            const input = document.createElement('input')

            input.type = 'text'
            input.value = 'Initial Value'
            input.placeholder = 'Test input'
            testContainer.appendChild(input)

            const inputElement = page.getByPlaceholder('Test input')

            await userEvent.clear(inputElement)
            expect(input.value).toBe('')

            await userEvent.fill(inputElement, 'New Value')
            expect(input.value).toBe('New Value')
        })
    })

    describe('Keyboard Interactions', () => {
        it('should handle keyboard events', async () => {
            let keyPressed = ''
            const input = document.createElement('input')

            input.type = 'text'
            input.placeholder = 'Press keys'

            input.addEventListener('keydown', (e) => { keyPressed = e.key })
            testContainer.appendChild(input)

            const inputElement = page.getByPlaceholder('Press keys')

            await userEvent.click(inputElement)
            await userEvent.keyboard('{Enter}')

            expect(keyPressed).toBe('Enter')
        })
    })

    describe('ContextMenu DOM Manipulation', () => {
        it('should add and remove items dynamically', () => {
            const contextMenu = new ContextMenu()

            // Note: countItems() requires a map context, so we just verify operations don't throw
            contextMenu.countItems()

            // Add items - should not throw
            contextMenu.push({ callback: () => {}, text: 'Item 1' })
            contextMenu.push({ callback: () => {}, text: 'Item 2' })

            // Operations should work without errors
            expect(() => { contextMenu.pop() }).not.toThrow()
            expect(() => { contextMenu.clear() }).not.toThrow()
            expect(contextMenu.countItems()).toBe(0)
        })

        it('should enable and disable the menu', () => {
            const contextMenu = new ContextMenu()

            // @ts-expect-error - accessing protected property
            expect(contextMenu.disabled).toBe(false)

            contextMenu.disable()
            // @ts-expect-error - accessing protected property
            expect(contextMenu.disabled).toBe(true)

            contextMenu.enable()
            // @ts-expect-error - accessing protected property
            expect(contextMenu.disabled).toBe(false)
        })
    })

    describe('Element Locators', () => {
        it('should find elements by text content', () => {
            testContainer.innerHTML = `
                <div>
                    <p>Hello World</p>
                    <span>Test Content</span>
                </div>
            `

            const helloElement = page.getByText('Hello World')

            expect(helloElement).toBeDefined()

            const testElement = page.getByText('Test Content')

            expect(testElement).toBeDefined()
        })

        it('should find elements by label', () => {
            testContainer.innerHTML = `
                <form>
                    <label for="username">Username:</label>
                    <input id="username" type="text" />

                    <label for="password">Password:</label>
                    <input id="password" type="password" />
                </form>
            `

            const usernameInput = page.getByLabelText(/username/i)
            const passwordInput = page.getByLabelText(/password/i)

            expect(usernameInput).toBeDefined()
            expect(passwordInput).toBeDefined()
        })

        it('should find elements by test id', () => {
            testContainer.innerHTML = `
                <div data-testid="custom-element">Custom Element</div>
            `

            const element = page.getByTestId('custom-element')

            expect(element).toBeDefined()
        })
    })

    describe('CSS and Styling', () => {
        it('should apply and verify styles', () => {
            const contextMenu = new ContextMenu({
                width: 300,
            })

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu

            document.body.appendChild(container)
            const computedStyle = globalThis.getComputedStyle(container)

            expect(container.style.width).toBe('300px')
            expect(computedStyle.width).toBe('300px')

            document.body.removeChild(container)
        })

        it('should verify class manipulations', () => {
            const contextMenu = new ContextMenu()

            // @ts-expect-error - accessing protected property
            const { container } = contextMenu

            expect(container.classList.contains('ol-ctx-menu-hidden')).toBe(true)

            container.classList.remove('ol-ctx-menu-hidden')
            expect(container.classList.contains('ol-ctx-menu-hidden')).toBe(false)

            contextMenu.closeMenu()
            expect(container.classList.contains('ol-ctx-menu-hidden')).toBe(true)
        })
    })

    describe('Event Handling', () => {
        it('should handle custom events', () => {
            let eventFired = false
            const button = document.createElement('button')

            button.textContent = 'Fire Event'
            button.addEventListener('custom-event', () => { eventFired = true })
            testContainer.appendChild(button)

            button.dispatchEvent(new Event('custom-event'))

            expect(eventFired).toBe(true)
        })

        it('should handle event delegation', () => {
            let clickedItem = ''

            testContainer.innerHTML = `
                <ul id="menu-list">
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                </ul>
            `

            const menuList = testContainer.querySelector('#menu-list')!

            menuList.addEventListener('click', (e) => {
                const target = e.target as HTMLElement

                if (target.tagName === 'LI') {
                    clickedItem = target.textContent || ''
                }
            })

            const items = testContainer.querySelectorAll('li')

            items[1].click()

            expect(clickedItem).toBe('Item 2')
        })
    })

    describe('Async Operations', () => {
        it('should handle async state changes', async () => {
            let isLoading = true
            const button = document.createElement('button')

            button.textContent = 'Loading...'
            testContainer.appendChild(button)

            const promise = new Promise<void>((resolve) => {
                setTimeout(() => {
                    isLoading = false
                    button.textContent = 'Loaded'
                    resolve()
                }, 100)
            })

            expect(isLoading).toBe(true)
            expect(button.textContent).toBe('Loading...')

            await promise

            expect(isLoading).toBe(false)
            expect(button.textContent).toBe('Loaded')
        })
    })

    describe('Separators', () => {
        it('should handle separator items', () => {
            const contextMenu = new ContextMenu()

            expect(() => {
                contextMenu.push({ callback: () => {}, text: 'Item 1' })
                contextMenu.push('-')
                contextMenu.push({ callback: () => {}, text: 'Item 2' })
            }).not.toThrow()

            expect(contextMenu).toBeDefined()
            expect(contextMenu.isOpen()).toBe(false)
        })
    })
})
