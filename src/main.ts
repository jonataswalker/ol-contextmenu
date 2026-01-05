import Control from 'ol/control/Control'
import { TinyEmitter } from 'tiny-emitter'

import { getLineHeight, addMenuEntries } from './helpers/dom.ts'
import {
    EventTypes,
    ContextMenuEvent,
    CustomEventTypes,
} from './types.ts'
import {
    CSS_CLASSES,
    DEFAULT_ITEMS,
    DEFAULT_OPTIONS,
    MENU_POSITION_BUFFER,
    MENU_POSITION_OFFSET,
    CONTAINER_PADDING_TOTAL,
} from './constants.ts'

import type OlMap from 'ol/Map'
import type { Pixel } from 'ol/pixel'
import type { EventsKey } from 'ol/events'
import type BaseEvent from 'ol/events/Event'
import type { ObjectEvent } from 'ol/Object'
import type { Coordinate } from 'ol/coordinate'
import type { Types as ObjectEventTypes } from 'ol/ObjectEventType'
import type { OnSignature, CombinedOnSignature, EventTypes as OlEventTypes } from 'ol/Observable'

import type {
    Item,
    Options,
    MenuEntry,
    CallbackObject,
} from './types.ts'

import './sass/main.scss'

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(message)
}

export default class ContextMenu extends Control {
    protected map!: OlMap

    protected emitter: TinyEmitter = new TinyEmitter()

    protected container: HTMLDivElement

    protected coordinate: Coordinate = []

    protected pixel: Pixel = []

    protected contextMenuEventListener: (evt: MouseEvent) => void

    protected entryCallbackEventListener: (evt: MouseEvent) => void

    protected mapMoveListener: () => void

    protected lineHeight = 0

    protected disabled: boolean

    protected opened: boolean

    protected items: Item[] = []

    protected menuEntries: Map<string, MenuEntry> = new Map()

    declare on: OnSignature<OlEventTypes | `${CustomEventTypes.CLOSE}`, BaseEvent, EventsKey>
        & OnSignature<
            `${CustomEventTypes.OPEN}` | `${CustomEventTypes.BEFOREOPEN}`,
            ContextMenuEvent,
            EventsKey
        >
        & OnSignature<ObjectEventTypes, ObjectEvent, EventsKey>
        & CombinedOnSignature<
            | OlEventTypes
            | ObjectEventTypes
            | `${CustomEventTypes.OPEN}`
            | `${CustomEventTypes.CLOSE}`
            | `${CustomEventTypes.BEFOREOPEN}`,
            EventsKey
        >

    declare once: OnSignature<OlEventTypes | `${CustomEventTypes.CLOSE}`, BaseEvent, EventsKey>
        & OnSignature<
            `${CustomEventTypes.OPEN}` | `${CustomEventTypes.BEFOREOPEN}`,
            ContextMenuEvent,
            EventsKey
        >
        & OnSignature<ObjectEventTypes, ObjectEvent, EventsKey>
        & CombinedOnSignature<
            | OlEventTypes
            | ObjectEventTypes
            | `${CustomEventTypes.OPEN}`
            | `${CustomEventTypes.CLOSE}`
            | `${CustomEventTypes.BEFOREOPEN}`,
            EventsKey
        >

    declare un: OnSignature<OlEventTypes | `${CustomEventTypes.CLOSE}`, BaseEvent, void>
        & OnSignature<
            `${CustomEventTypes.OPEN}` | `${CustomEventTypes.BEFOREOPEN}`,
            ContextMenuEvent,
            EventsKey
        >
        & OnSignature<ObjectEventTypes, ObjectEvent, void>
        & CombinedOnSignature<
            | OlEventTypes
            | ObjectEventTypes
            | `${CustomEventTypes.OPEN}`
            | `${CustomEventTypes.CLOSE}`
            | `${CustomEventTypes.BEFOREOPEN}`,
            void
        >

    options: Options

    constructor(opts: Partial<Options> = {}) {
        assert(typeof opts === 'object', '@param `opts` should be object type!')

        const container = document.createElement('div')

        super({ element: container })

        this.options = { ...DEFAULT_OPTIONS, ...opts }
        const menu = document.createElement('ul')

        container.append(menu)
        container.style.width = `${this.options.width}px`
        container.classList.add(
            CSS_CLASSES.container,
            CSS_CLASSES.unselectable,
            CSS_CLASSES.hidden,
        )

        this.container = container

        this.contextMenuEventListener = (evt: MouseEvent) => {
            this.handleContextMenu(evt)
        }

        this.entryCallbackEventListener = (evt: MouseEvent) => {
            this.handleEntryCallback(evt)
        }

        this.mapMoveListener = () => {
            this.handleMapMove()
        }
        this.disabled = false
        this.opened = false

        window.addEventListener(
            'beforeunload',
            () => {
                this.removeListeners()
            },
            { once: true },
        )
    }

    clear() {
        for (const id of this.menuEntries.keys()) {
            this.removeMenuEntry(id)
        }

        this.container.replaceChildren()
        this.container.append(document.createElement('ul'))
    }

    enable() {
        this.disabled = false
    }

    disable() {
        this.disabled = true
    }

    getDefaultItems() {
        return DEFAULT_ITEMS
    }

    countItems() {
        return this.menuEntries.size
    }

    extend(items: Item[]) {
        assert(Array.isArray(items), '@param `items` should be an Array.')
        addMenuEntries({
            container: this.container.firstElementChild as HTMLUListElement,
            emitter: this.emitter,
            items,
            menuWidth: this.options.width,
        })
    }

    closeMenu() {
        this.opened = false
        this.container.classList.add(CSS_CLASSES.hidden)
        this.dispatchEvent(CustomEventTypes.CLOSE)
    }

    isOpen() {
        return this.opened
    }

    updatePosition(pixel: Pixel) {
        assert(Array.isArray(pixel), '@param `pixel` should be an Array.')

        if (this.isOpen()) {
            this.pixel = pixel
            this.positionContainer()
        }
    }

    pop() {
        const last = Array.from(this.menuEntries.keys()).pop()

        last && this.removeMenuEntry(last)
    }

    shift() {
        const first = Array.from(this.menuEntries.keys()).shift()

        first && this.removeMenuEntry(first)
    }

    push(item: Item) {
        item && this.extend([item])
    }

    setMap(map: OlMap): void {
        super.setMap(map)

        if (map) {
            this.map = map

            map.getViewport().addEventListener(
                this.options.eventType,
                this.contextMenuEventListener,
                false,
            )

            map.on('movestart', () => {
                this.handleMapMove()
            })

            this.emitter.on(
                CustomEventTypes.ADD_MENU_ENTRY,
                (item: MenuEntry, element: HTMLLIElement) => {
                    this.handleAddMenuEntry(item, element)
                },
                this,
            )

            this.items = this.options.defaultItems
                ? this.options.items.concat(DEFAULT_ITEMS)
                : this.options.items

            addMenuEntries({
                container: this.container.firstElementChild as HTMLUListElement,
                emitter: this.emitter,
                items: this.items,
                menuWidth: this.options.width,
            })

            const entriesLength = this.getMenuEntriesLength()

            this.lineHeight
                = entriesLength > 0
                    ? this.container.offsetHeight / entriesLength
                    : getLineHeight(this.container)
        }
        else {
            this.removeListeners()
            this.clear()
        }
    }

    protected removeListeners() {
        this.map
            .getViewport()
            .removeEventListener(this.options.eventType, this.contextMenuEventListener, false)

        this.emitter.off(CustomEventTypes.ADD_MENU_ENTRY)
    }

    protected removeMenuEntry(id: string) {
        let element = document.getElementById(id)

        element?.remove()
        element = null
        this.menuEntries.delete(id)
    }

    protected handleContextMenu(evt: MouseEvent) {
        this.coordinate = this.map.getEventCoordinate(evt)
        this.pixel = this.map.getEventPixel(evt)

        this.dispatchEvent(
            new ContextMenuEvent({
                map: this.map,
                originalEvent: evt,
                type: CustomEventTypes.BEFOREOPEN,
            }),
        )

        if (this.disabled) return

        if (this.options.eventType === EventTypes.CONTEXTMENU) {
            evt.stopPropagation()
            evt.preventDefault()
        }

        setTimeout(() => {
            this.openMenu(evt)
        })

        evt.target?.addEventListener(
            'pointerdown',
            (event) => {
                if (this.opened) {
                    event.stopPropagation()
                    this.closeMenu()
                }
            },
            { once: true },
        )
    }

    protected openMenu(evt: MouseEvent) {
        this.opened = true
        this.positionContainer()
        this.container.classList.remove(CSS_CLASSES.hidden)

        this.dispatchEvent(
            new ContextMenuEvent({
                map: this.map,
                originalEvent: evt,
                type: CustomEventTypes.OPEN,
            }),
        )
    }

    protected getMenuEntriesLength(): number {
        return Array.from(this.menuEntries).filter(
            ([, v]) =>
                v.isSeparator === false && v.isSubmenu === false && v.isInsideSubmenu === false,
        ).length
    }

    protected calculateMenuSize(): { h: number, w: number } {
        const entriesLength = this.getMenuEntriesLength()
        const contentHeight = Math.round(this.lineHeight * entriesLength)
        const calculatedHeight = contentHeight + CONTAINER_PADDING_TOTAL
        const actualHeight = this.container.offsetHeight
        const isVisible = !this.container.classList.contains(CSS_CLASSES.hidden)

        return {
            h: actualHeight > 0 && isVisible ? actualHeight : calculatedHeight,
            w: this.container.offsetWidth,
        }
    }

    protected calculateVerticalPosition(
        mapSize: [number, number],
        spaceLeft: { h: number, w: number },
        menuSize: { h: number, w: number },
    ): number {
        let top: number

        if (spaceLeft.h >= menuSize.h) {
            top = this.pixel[1] - MENU_POSITION_OFFSET

            if (top + menuSize.h > mapSize[1]) {
                top = Math.max(0, mapSize[1] - menuSize.h - MENU_POSITION_BUFFER)
            }
        }
        else {
            top = this.pixel[1] - menuSize.h

            if (top < 0) {
                top = menuSize.h <= mapSize[1] ? 0 : Math.max(0, mapSize[1] - menuSize.h)
            }

            if (top + menuSize.h > mapSize[1]) {
                top = Math.max(0, mapSize[1] - menuSize.h - MENU_POSITION_BUFFER)
            }
        }

        return Math.max(0, Math.min(top, mapSize[1] - menuSize.h - MENU_POSITION_BUFFER))
    }

    protected adjustPositionAfterRender(
        mapSize: [number, number],
        menuSize: { h: number, w: number },
    ) {
        if (!this.container.classList.contains(CSS_CLASSES.hidden)) {
            const renderedHeight = this.container.offsetHeight

            if (renderedHeight > 0 && renderedHeight !== menuSize.h) {
                const currentTop = Number.parseInt(this.container.style.top, 10) || 0

                if (currentTop + renderedHeight > mapSize[1]) {
                    this.container.style.top = `${Math.max(0, mapSize[1] - renderedHeight - MENU_POSITION_BUFFER)}px`
                }
            }
        }
    }

    protected positionContainer() {
        const mapSizeRaw = this.map.getSize() || [0, 0]
        const mapSize: [number, number] = [mapSizeRaw[0] || 0, mapSizeRaw[1] || 0]
        const spaceLeft = {
            h: mapSize[1] - this.pixel[1],
            w: mapSize[0] - this.pixel[0],
        }
        const menuSize = this.calculateMenuSize()
        const left = spaceLeft.w >= menuSize.w ? this.pixel[0] + 5 : this.pixel[0] - menuSize.w

        this.container.style.left = `${left}px`

        const top = this.calculateVerticalPosition(mapSize, spaceLeft, menuSize)

        this.container.style.top = `${top}px`
        this.container.style.right = 'auto'
        this.container.style.bottom = 'auto'

        this.adjustPositionAfterRender(mapSize, menuSize)
        spaceLeft.w -= menuSize.w

        const containerSubmenuChildren = (container: HTMLUListElement): HTMLLIElement[] =>
            Array.from(container.children).filter(
                (el) => el.tagName === 'LI' && el.classList.contains(CSS_CLASSES.submenu),
            ) as HTMLLIElement[]

        let countSubMenu = 0
        const positionSubmenu = (container: HTMLUListElement, spaceLeftWidth: number) => {
            countSubMenu += 1
            const elements = containerSubmenuChildren(container)

            elements.forEach((element) => {
                const lastLeft
                    = spaceLeftWidth >= menuSize.w ? menuSize.w - 8 : (menuSize.w + 8) * -1

                const submenu = element.querySelector(
                    `ul.${CSS_CLASSES.container}`,
                ) as HTMLUListElement

                const submenuHeight = Math.round(
                    this.lineHeight
                    * Array.from(submenu.children).filter((el) => el.tagName === 'LI').length,
                )

                submenu.style.left = `${lastLeft}px`
                submenu.style.right = 'auto'
                submenu.style.top
                    = spaceLeft.h >= submenuHeight + menuSize.h
                        ? '0'
                        : `-${submenu.offsetHeight - 25}px`
                submenu.style.bottom = 'auto'
                submenu.style.zIndex = String(countSubMenu)

                if (containerSubmenuChildren(submenu).length > 0) {
                    positionSubmenu(submenu, spaceLeftWidth - menuSize.w)
                }
            })
        }

        positionSubmenu(this.container.firstElementChild as HTMLUListElement, spaceLeft.w)
    }

    protected handleMapMove() {
        this.closeMenu()
    }

    protected handleEntryCallback(evt: MouseEvent) {
        evt.preventDefault()
        evt.stopPropagation()

        const target = evt.currentTarget as HTMLLIElement
        const item = this.menuEntries.get(target.id)

        if (!item) return

        const object: CallbackObject = {
            coordinate: this.coordinate,
            data: item.data,
        }

        this.closeMenu()
        item.callback?.(object, this.map)
    }

    protected handleAddMenuEntry(item: MenuEntry, element: HTMLLIElement) {
        this.menuEntries.set(item.id, item)
        this.positionContainer()

        if ('callback' in item && typeof item.callback === 'function') {
            element.addEventListener('click', this.entryCallbackEventListener, false)
        }
    }
}

export {
    type Item,
    type Options,
    type MenuEntry,
    type SingleItem,
    type EventTypes,
    type ItemSeparator,
    type ItemWithNested,
    type CallbackObject,
    type ContextMenuEvent,
    type CustomEventTypes,
} from './types.ts'
