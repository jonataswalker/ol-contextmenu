import { CSS_CLASSES } from '../constants.ts'
import { type Item, type MenuEntry, CustomEventTypes } from '../types.ts'

import type { TinyEmitter } from 'tiny-emitter'

export function createFragment(html: string): DocumentFragment {
    const fragment = document.createDocumentFragment()
    const div = document.createElement('div')

    div.innerHTML = html

    while (div.firstChild) {
        fragment.append(div.firstChild)
    }

    return fragment
}

export function getLineHeight(container: HTMLDivElement): number {
    const cloned = document.importNode(container)
    const width = container.offsetWidth

    cloned.style.cssText = `position: fixed; top: 0; left: 0; overflow: auto; visibility: hidden; pointer-events: none; height: unset; max-height: unset; width: ${width}px`

    const frag = createFragment('<span>Foo</span>')
    const frag2 = createFragment('<span>Foo</span>')
    const element = document.createElement('li')
    const element2 = document.createElement('li')

    element.append(frag)
    element2.append(frag2)
    cloned.append(element)
    cloned.append(element2)
    container.parentNode?.append(cloned)

    const height = cloned.offsetHeight / 2

    container.parentNode?.removeChild(cloned)

    return height
}

export function addMenuEntry({
    emitter,
    isInsideSubmenu = false,
    isSubmenu = false,
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
        const html = `<span>${item.text}</span>`
        const frag = createFragment(html)
        const element = document.createElement('li')

        item.classname = item.classname || ''

        if (item.icon) {
            if (item.classname === '') {
                item.classname = CSS_CLASSES.icon
            }
            else if (item.classname.includes(CSS_CLASSES.icon) === false) {
                item.classname += ` ${CSS_CLASSES.icon}`
            }

            element.setAttribute('style', `background-image:url(${item.icon})`)
        }

        element.id = id
        element.className = item.classname
        element.append(frag)
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

    const html = `<li id="${id}" class="${CSS_CLASSES.separator}"><hr></li>`
    const frag = createFragment(html)

    parentNode.append(frag)

    const element = parentNode.lastChild as HTMLLIElement
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
        }
        else {
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
