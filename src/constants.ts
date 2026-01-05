import { EventTypes, type Options, type SingleItem } from './types.ts'

export const DEFAULT_OPTIONS: Options = {
    defaultItems: true,
    eventType: EventTypes.CONTEXTMENU,
    items: [],
    scrollAt: 4,
    width: 150,
}

const NAMESPACE = 'ol-ctx-menu'

export const CSS_CLASSES = {
    container: `${NAMESPACE}-container`,
    hidden: `${NAMESPACE}-hidden`,
    icon: `${NAMESPACE}-icon`,
    namespace: NAMESPACE,
    separator: `${NAMESPACE}-separator`,
    submenu: `${NAMESPACE}-submenu`,
    unselectable: 'ol-unselectable',
    zoomIn: `${NAMESPACE}-zoom-in`,
    zoomOut: `${NAMESPACE}-zoom-out`,
}

// Container padding from SCSS: $container-padding: 8px
export const CONTAINER_PADDING = 8

export const CONTAINER_PADDING_TOTAL = CONTAINER_PADDING * 2

// Offset when positioning menu below click point
export const MENU_POSITION_OFFSET = 10

// Safety buffer to prevent menu cutoff at viewport edges
export const MENU_POSITION_BUFFER = 2

export const DEFAULT_ITEMS: SingleItem[] = [
    {
        callback: (object, map) => {
            const view = map.getView()

            view.animate({
                center: object.coordinate,
                duration: 700,
                zoom: Number(view.getZoom()) + 1,
            })
        },
        classname: `${CSS_CLASSES.zoomIn} ${CSS_CLASSES.icon}`,
        text: 'Zoom In',
    },
    {
        callback: (object, map) => {
            const view = map.getView()

            view.animate({
                center: object.coordinate,
                duration: 700,
                zoom: Number(view.getZoom()) - 1,
            })
        },
        classname: `${CSS_CLASSES.zoomOut} ${CSS_CLASSES.icon}`,
        text: 'Zoom Out',
    },
]
