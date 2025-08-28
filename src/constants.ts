import { EventTypes, type SingleItem, type Options } from './types';

export const DEFAULT_OPTIONS: Options = {
    width: 150,
    scrollAt: 4,
    eventType: EventTypes.CONTEXTMENU,
    defaultItems: true,
    items: [],
    hideOnMove: true,
};

const NAMESPACE = 'ol-ctx-menu';

export const CSS_CLASSES = {
    namespace: NAMESPACE,
    container: `${NAMESPACE}-container`,
    separator: `${NAMESPACE}-separator`,
    submenu: `${NAMESPACE}-submenu`,
    hidden: `${NAMESPACE}-hidden`,
    icon: `${NAMESPACE}-icon`,
    zoomIn: `${NAMESPACE}-zoom-in`,
    zoomOut: `${NAMESPACE}-zoom-out`,
    unselectable: 'ol-unselectable',
};

export const DEFAULT_ITEMS: SingleItem[] = [
    {
        text: 'Zoom In',
        classname: `${CSS_CLASSES.zoomIn} ${CSS_CLASSES.icon}`,
        callback: (object, map) => {
            const view = map.getView();

            view.animate({
                zoom: Number(view.getZoom()) + 1,
                duration: 700,
                center: object.coordinate,
            });
        },
    },
    {
        text: 'Zoom Out',
        classname: `${CSS_CLASSES.zoomOut} ${CSS_CLASSES.icon}`,
        callback: (object, map) => {
            const view = map.getView();

            view.animate({
                zoom: Number(view.getZoom()) - 1,
                duration: 700,
                center: object.coordinate,
            });
        },
    },
];
