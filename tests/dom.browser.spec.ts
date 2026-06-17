import { it, expect, describe, afterEach } from 'vitest'

import { getLineHeight } from '../src/helpers/dom.ts'

function createContainer(className: string): HTMLDivElement {
    const container = document.createElement('div')

    container.className = className
    document.body.append(container)

    return container
}

describe('getLineHeight', () => {
    afterEach(() => {
        document.body.replaceChildren()

        for (const style of document.head.querySelectorAll('style[data-test]')) {
            style.remove()
        }
    })

    it('ignores the container vertical padding when measuring line height', () => {
        const style = document.createElement('style')

        style.dataset.test = 'line-height'
        style.textContent = [
            '.lh-base li, .lh-padded li { margin: 0; padding: 0; list-style: none; font-size: 16px; line-height: 16px }',
            '.lh-padded { padding-top: 25px; padding-bottom: 25px }',
        ].join('\n')
        document.head.append(style)

        const base = createContainer('lh-base')
        const padded = createContainer('lh-padded')

        // The measured line height must not change just because the container
        // has vertical padding. Before the fix, offsetHeight / 2 counted that
        // padding, inflating the value and leaving a gap for upward menus.
        expect(getLineHeight(padded)).toBe(getLineHeight(base))
    })
})
