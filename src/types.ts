import MapBrowserEvent from 'ol/MapBrowserEvent'

import type OlMap from 'ol/Map'
import type { Coordinate } from 'ol/coordinate'

export enum EventTypes {
    CONTEXTMENU = 'contextmenu',
    CLICK = 'click',
    DBLCLICK = 'dblclick',
}

export enum CustomEventTypes {
    BEFOREOPEN = 'beforeopen',
    OPEN = 'open',
    CLOSE = 'close',
    ADD_MENU_ENTRY = 'add-menu-entry',
}

export class ContextMenuEvent extends MapBrowserEvent<any> {
    constructor(options: {
        map: OlMap
        originalEvent: MouseEvent | PointerEvent
        type: `${CustomEventTypes.OPEN}` | `${CustomEventTypes.BEFOREOPEN}`
    }) {
        super(options.type, options.map, options.originalEvent as any)
    }
}

export type CallbackObject = {
    coordinate: Coordinate
    data: unknown
}

export type ItemSeparator = '-'

export type SingleItem = {
    callback: (object: CallbackObject, map: OlMap) => void
    classname?: string
    data?: unknown
    icon?: string
    text: string
}

export type MenuEntry = {
    callback: null | SingleItem['callback']
    data: unknown
    id: string
    isInsideSubmenu: boolean
    isSeparator: boolean
    isSubmenu: boolean
}

export type ItemWithNested = {
    classname?: string
    icon?: string
    items: Item[]
    text: string
}

export type Item = SingleItem | ItemSeparator | ItemWithNested

export type Options = {
    defaultItems: boolean
    eventType: `${EventTypes}`
    items: Item[]
    scrollAt: number
    width: number
}
