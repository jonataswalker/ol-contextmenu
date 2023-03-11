import type { Coordinate } from 'ol/coordinate';
import { Map as OlMap, MapBrowserEvent } from 'ol';

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

export class ContextMenuEvent extends MapBrowserEvent<MouseEvent> {
    constructor(options: {
        type: `${CustomEventTypes.BEFOREOPEN}` | `${CustomEventTypes.OPEN}`;
        map: OlMap;
        originalEvent: MouseEvent;
    }) {
        super(options.type, options.map, options.originalEvent);
    }
}

export type CallbackObject = {
    coordinate: Coordinate;
    data: unknown;
};

export type ItemSeparator = '-';

export type SingleItem = {
    text: string;
    classname?: string;
    icon?: string;
    callback: (object: CallbackObject, map: OlMap) => void;
    data?: unknown;
};

export type MenuEntry = {
    id: string;
    isSubmenu: boolean;
    isInsideSubmenu: boolean;
    isSeparator: boolean;
    callback: SingleItem['callback'] | null;
    data: unknown;
};

export type ItemWithNested = {
    text: string;
    classname?: string;
    icon?: string;
    items: Item[];
};

export type Item = SingleItem | ItemSeparator | ItemWithNested;

export type Options = {
    width: number;
    scrollAt: number;
    eventType: `${EventTypes}`;
    defaultItems: boolean;
    items: Item[];
};
