import { expectTypeOf } from 'vitest'
import ContextMenu, {
    type Item,
    type Options,
    type MenuEntry,
    type SingleItem,
    type ItemSeparator,
    type ItemWithNested,
    type CallbackObject,
    type ContextMenuEvent,
} from 'ol-contextmenu'

import type OlMap from 'ol/Map'
import type { Pixel } from 'ol/pixel'
import type { Coordinate } from 'ol/coordinate'

expectTypeOf(ContextMenu).toBeConstructibleWith()
expectTypeOf(ContextMenu).toBeConstructibleWith({ eventType: 'click', items: ['-'], width: 180 })
expectTypeOf(ContextMenu).constructorParameters.toEqualTypeOf<[opts?: Partial<Options>]>()

expectTypeOf<Options>().toEqualTypeOf<{
    defaultItems: boolean
    eventType: 'click' | 'contextmenu' | 'dblclick'
    items: Item[]
    scrollAt: number
    width: number
}>()
expectTypeOf<CallbackObject>().toEqualTypeOf<{ coordinate: Coordinate; data: unknown }>()
expectTypeOf<SingleItem>().toEqualTypeOf<{
    callback: (object: CallbackObject, map: OlMap) => void
    classname?: string
    data?: unknown
    icon?: string
    text: string
}>()
expectTypeOf<ItemSeparator>().toEqualTypeOf<'-'>()
expectTypeOf<ItemWithNested>().toEqualTypeOf<{
    classname?: string
    icon?: string
    items: Item[]
    text: string
}>()
expectTypeOf<Item>().toEqualTypeOf<SingleItem | ItemSeparator | ItemWithNested>()
expectTypeOf<MenuEntry['callback']>().toEqualTypeOf<SingleItem['callback'] | null>()

const menu = new ContextMenu()

expectTypeOf(menu.options).toEqualTypeOf<Options>()
expectTypeOf<ContextMenu['extend']>().toEqualTypeOf<(items: Item[]) => void>()
expectTypeOf<ContextMenu['push']>().toEqualTypeOf<(item: Item) => void>()
expectTypeOf<ContextMenu['updatePosition']>().toEqualTypeOf<(pixel: Pixel) => void>()
expectTypeOf<ContextMenu['setMap']>().toEqualTypeOf<(map: OlMap) => void>()
expectTypeOf<ContextMenu['isOpen']>().toEqualTypeOf<() => boolean>()
expectTypeOf<ContextMenu['countItems']>().toEqualTypeOf<() => number>()
expectTypeOf<ContextMenu['getDefaultItems']>().toEqualTypeOf<() => SingleItem[]>()

menu.on('open', (evt) => {
    expectTypeOf(evt).toEqualTypeOf<ContextMenuEvent>()
})
menu.on('beforeopen', (evt) => {
    expectTypeOf(evt).toEqualTypeOf<ContextMenuEvent>()
    expectTypeOf(evt.pixel).toEqualTypeOf<Pixel>()
})

// @ts-expect-error unknown menu event
menu.on('opened', () => {})

// @ts-expect-error eventType only accepts the documented DOM events
expectTypeOf(ContextMenu).toBeConstructibleWith({ eventType: 'mousedown' })

// @ts-expect-error a single item needs a callback
menu.push({ text: 'Center map here' })

// @ts-expect-error container is internal
expectTypeOf(menu).toHaveProperty('container')
