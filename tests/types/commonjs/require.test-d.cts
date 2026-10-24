import ContextMenu = require('ol-contextmenu')

const item: ContextMenu.SingleItem = {
    callback: (object, map) => {
        map.getView().setCenter(object.coordinate)
    },
    text: 'Center map here',
}
const items: ContextMenu.Item[] = ['-', item]
const options: Partial<ContextMenu.Options> = { eventType: 'click', items, width: 180 }
const menu: ContextMenu = new ContextMenu(options)

menu.push(item)
menu.on('open', (evt: ContextMenu.ContextMenuEvent) => {
    const pixel: number[] = evt.pixel
    return pixel
})

const isOpen: boolean = menu.isOpen()

// @ts-expect-error eventType only accepts the documented DOM events
const invalid = new ContextMenu({ eventType: 'mousedown' })

// @ts-expect-error the CommonJS build exports only the class
const eventTypes: unknown = ContextMenu.EventTypes

export = { eventTypes, invalid, isOpen }
