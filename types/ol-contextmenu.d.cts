import type * as Esm from './ol-contextmenu.js' with { 'resolution-mode': 'import' }

declare const ContextMenu: typeof Esm.default
type ContextMenu = Esm.default

declare namespace ContextMenu {
    export type CallbackObject = Esm.CallbackObject
    export type ContextMenuEvent = Esm.ContextMenuEvent
    export type CustomEventTypes = Esm.CustomEventTypes
    export type EventTypes = Esm.EventTypes
    export type Item = Esm.Item
    export type ItemSeparator = Esm.ItemSeparator
    export type ItemWithNested = Esm.ItemWithNested
    export type MenuEntry = Esm.MenuEntry
    export type Options = Esm.Options
    export type SingleItem = Esm.SingleItem
}

export = ContextMenu
