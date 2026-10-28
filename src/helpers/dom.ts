import { CSS_CLASSES } from '../constants.ts'
import { type Item, type MenuEntry, CustomEventTypes } from '../types.ts'

import type { TinyEmitter } from 'tiny-emitter'

function sampleRow(): HTMLLIElement {
    const element = document.createElement('li')
    const span = document.createElement('span')

    span.textContent = 'Foo'
    element.append(span)

    return element
}

function separatorRow(id: string): HTMLLIElement {
    const element = document.createElement('li')

    element.id = id
    element.className = CSS_CLASSES.separator
    element.append(document.createElement('hr'))

    return element
}

export function cssString(value: string): string {
    const escaped = value.replaceAll(
        /["\\\n\r\f]/g,
        (char) => `\\${(char.codePointAt(0) ?? 0).toString(16)} `,
    )

    return `"${escaped}"`
}

export function getLineHeight(container: HTMLDivElement): number {
    const cloned = document.importNode(container)
    const width = container.offsetWidth

    cloned.style.cssText = `position: fixed; top: 0; left: 0; overflow: auto; visibility: hidden; pointer-events: none; height: unset; max-height: unset; width: ${width}px`

    cloned.append(sampleRow(), sampleRow())
    container.parentNode?.append(cloned)

    const clonedStyle = getComputedStyle(cloned)
    const paddingTop = Number.parseInt(clonedStyle.paddingTop, 10)
    const paddingBottom = Number.parseInt(clonedStyle.paddingBottom, 10)

    const height = (cloned.offsetHeight - (paddingTop + paddingBottom)) / 2

    container.parentNode?.removeChild(cloned)

    return height
}

export function addMenuEntry({
    emitter,
    isInsideSubmenu = false,
    isSubmenu,
    item,
    parentNode,
}: {
    emitter: TinyEmitter
    isInsideSubmenu?: boolean
    isSubmenu: boolean
    item: Item
    parentNode: HTMLUListElement
}): HTMLLIElement {
    const id = `_${Math.random().toString(36).slice(2, 11)}`

    if (typeof item !== 'string' && 'text' in item) {
        const span = document.createElement('span')
        const element = document.createElement('li')

        span.innerHTML = item.text

        let classname = item.classname || ''

        if (item.icon) {
            if (classname === '') {
                classname = CSS_CLASSES.icon
            } else if (classname.includes(CSS_CLASSES.icon) === false) {
                classname += ` ${CSS_CLASSES.icon}`
            }

            element.style.backgroundImage = `url(${cssString(item.icon)})`
        }

        element.id = id
        element.className = classname
        element.append(span)
        parentNode.append(element)

        const entry: MenuEntry = {
            callback: 'callback' in item ? item.callback : null,
            data: 'data' in item ? item.data : null,
            id,
            isInsideSubmenu,
            isSeparator: false,
            isSubmenu,
        }

        emitter.emit(CustomEventTypes.ADD_MENU_ENTRY, entry, element)

        return element
    }

    const element = separatorRow(id)

    parentNode.append(element)

    const entry: MenuEntry = {
        callback: null,
        data: null,
        id,
        isInsideSubmenu: false,
        isSeparator: true,
        isSubmenu: false,
    }

    emitter.emit(CustomEventTypes.ADD_MENU_ENTRY, entry, element)

    return element
}

export function addMenuEntries({
    container,
    emitter,
    isInsideSubmenu,
    items,
    menuWidth,
}: {
    container: HTMLUListElement
    emitter: TinyEmitter
    isInsideSubmenu?: boolean
    items: Item[]
    menuWidth: number
}) {
    items.forEach((item) => {
        if (typeof item !== 'string' && 'items' in item && Array.isArray(item.items)) {
            const li = addMenuEntry({ emitter, isSubmenu: true, item, parentNode: container })

            li.classList.add(CSS_CLASSES.submenu)
            const ul = document.createElement('ul')

            ul.classList.add(CSS_CLASSES.container)
            ul.style.width = `${menuWidth}px`

            li.append(ul)

            addMenuEntries({
                container: ul,
                emitter,
                isInsideSubmenu: true,
                items: item.items,
                menuWidth,
            })
        } else {
            addMenuEntry({
                emitter,
                isInsideSubmenu,
                isSubmenu: false,
                item,
                parentNode: container,
            })
        }
    })
}
