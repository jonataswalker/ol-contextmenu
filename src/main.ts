import type { Pixel } from 'ol/pixel';
import type { Coordinate } from 'ol/coordinate';
import OlMap from 'ol/Map';
import Control from 'ol/control/Control';
import BaseEvent from 'ol/events/Event';
import { EventsKey } from 'ol/events';
import { Types as ObjectEventTypes } from 'ol/ObjectEventType';
import { CombinedOnSignature, EventTypes as OlEventTypes, OnSignature } from 'ol/Observable';
import { ObjectEvent } from 'ol/Object';

import { CSS_CLASSES, DEFAULT_ITEMS, DEFAULT_OPTIONS } from './constants';
import {
    CallbackObject,
    ContextMenuEvent,
    CustomEventTypes,
    EventTypes,
    Item,
    MenuEntry,
    Options,
} from './types';
import emitter from './emitter';
import { addMenuEntries, getLineHeight } from './helpers/dom';

import './sass/main.scss';

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(message);
}

export default class ContextMenu extends Control {
    protected map!: OlMap;

    protected container: HTMLDivElement;

    protected coordinate: Coordinate = [];

    protected pixel: Pixel = [];

    protected contextMenuEventListener: (evt: MouseEvent) => void;

    protected entryCallbackEventListener: (evt: MouseEvent) => void;

    protected mapMoveListener: () => void;

    protected lineHeight = 0;

    protected disabled: boolean;

    protected opened: boolean;

    protected items: Item[] = [];

    protected menuEntries: Map<string, MenuEntry> = new Map();

    declare on: OnSignature<OlEventTypes | `${CustomEventTypes.CLOSE}`, BaseEvent, EventsKey> &
        OnSignature<
            `${CustomEventTypes.BEFOREOPEN}` | `${CustomEventTypes.OPEN}`,
            ContextMenuEvent,
            EventsKey
        > &
        OnSignature<ObjectEventTypes, ObjectEvent, EventsKey> &
        CombinedOnSignature<
            | `${CustomEventTypes.BEFOREOPEN}`
            | `${CustomEventTypes.OPEN}`
            | ObjectEventTypes
            | `${CustomEventTypes.CLOSE}`
            | OlEventTypes,
            EventsKey
        >;

    declare once: OnSignature<OlEventTypes | `${CustomEventTypes.CLOSE}`, BaseEvent, EventsKey> &
        OnSignature<
            `${CustomEventTypes.BEFOREOPEN}` | `${CustomEventTypes.OPEN}`,
            ContextMenuEvent,
            EventsKey
        > &
        OnSignature<ObjectEventTypes, ObjectEvent, EventsKey> &
        CombinedOnSignature<
            | `${CustomEventTypes.BEFOREOPEN}`
            | `${CustomEventTypes.OPEN}`
            | ObjectEventTypes
            | `${CustomEventTypes.CLOSE}`
            | OlEventTypes,
            EventsKey
        >;

    declare un: OnSignature<OlEventTypes | `${CustomEventTypes.CLOSE}`, BaseEvent, void> &
        OnSignature<
            `${CustomEventTypes.BEFOREOPEN}` | `${CustomEventTypes.OPEN}`,
            ContextMenuEvent,
            EventsKey
        > &
        OnSignature<ObjectEventTypes, ObjectEvent, void> &
        CombinedOnSignature<
            | `${CustomEventTypes.BEFOREOPEN}`
            | `${CustomEventTypes.OPEN}`
            | ObjectEventTypes
            | `${CustomEventTypes.CLOSE}`
            | OlEventTypes,
            void
        >;

    options: Options;

    constructor(opts: Partial<Options> = {}) {
        assert(typeof opts === 'object', '@param `opts` should be object type!');

        const container = document.createElement('div');

        super({ element: container });

        this.options = { ...DEFAULT_OPTIONS, ...opts };
        const menu = document.createElement('ul');

        container.append(menu);
        container.style.width = `${this.options.width}px`;
        container.classList.add(
            CSS_CLASSES.container,
            CSS_CLASSES.unselectable,
            CSS_CLASSES.hidden
        );

        this.container = container;
        this.contextMenuEventListener = (evt: MouseEvent) => {
            this.handleContextMenu(evt);
        };
        this.entryCallbackEventListener = (evt: MouseEvent) => {
            this.handleEntryCallback(evt);
        };
        this.mapMoveListener = () => {
            this.handleMapMove();
        };
        this.disabled = false;
        this.opened = false;
    }

    clear() {
        for (const id of this.menuEntries.keys()) {
            this.removeMenuEntry(id);
        }

        this.container.replaceChildren();
        this.container.append(document.createElement('ul'));
    }

    enable() {
        this.disabled = false;
    }

    disable() {
        this.disabled = true;
    }

    getDefaultItems() {
        return DEFAULT_ITEMS;
    }

    countItems() {
        return this.menuEntries.size;
    }

    extend(items: Item[]) {
        assert(Array.isArray(items), '@param `items` should be an Array.');
        addMenuEntries(
            this.container.firstElementChild as HTMLUListElement,
            items,
            this.options.width
        );
    }

    closeMenu() {
        this.opened = false;
        this.container.classList.add(CSS_CLASSES.hidden);
        this.dispatchEvent(CustomEventTypes.CLOSE);
    }

    isOpen() {
        return this.opened;
    }

    updatePosition(pixel: Pixel) {
        assert(Array.isArray(pixel), '@param `pixel` should be an Array.');

        if (this.isOpen()) {
            this.pixel = pixel;
            this.positionContainer();
        }
    }

    pop() {
        const last = Array.from(this.menuEntries.keys()).pop();

        last && this.removeMenuEntry(last);
    }

    shift() {
        const first = Array.from(this.menuEntries.keys()).shift();

        first && this.removeMenuEntry(first);
    }

    push(item: Item) {
        item && this.extend([item]);
    }

    setMap(map: OlMap): void {
        super.setMap(map);

        if (map) {
            this.map = map;
            this.map
                .getViewport()
                .addEventListener(this.options.eventType, this.contextMenuEventListener, false);

            this.map.on('movestart', () => {
                this.handleMapMove();
            });

            emitter.on(
                CustomEventTypes.ADD_MENU_ENTRY,
                (item: MenuEntry, element: HTMLLIElement) => {
                    this.handleAddMenuEntry(item, element);
                },
                this
            );

            this.items = this.options.defaultItems
                ? this.options.items.concat(DEFAULT_ITEMS)
                : this.options.items;

            addMenuEntries(
                this.container.firstElementChild as HTMLUListElement,
                this.items,
                this.options.width
            );

            const entriesLength = this.getMenuEntriesLength();

            this.lineHeight =
                entriesLength > 0
                    ? this.container.offsetHeight / entriesLength
                    : getLineHeight(this.container);
        } else {
            this.removeListeners();
            this.clear();
        }
    }

    protected removeListeners() {
        this.map
            .getViewport()
            .removeEventListener(this.options.eventType, this.contextMenuEventListener, false);

        emitter.off(CustomEventTypes.ADD_MENU_ENTRY);
    }

    protected removeMenuEntry(id: string) {
        const element = document.getElementById(id);

        element?.remove();
        element?.removeEventListener('click', this.entryCallbackEventListener);
        this.menuEntries.delete(id);
    }

    protected handleContextMenu(evt: MouseEvent) {
        this.coordinate = this.map.getEventCoordinate(evt);
        this.pixel = this.map.getEventPixel(evt);
        this.dispatchEvent(
            new ContextMenuEvent({
                type: CustomEventTypes.BEFOREOPEN,
                map: this.map,
                originalEvent: evt
            })
        );

        if (this.disabled) return;

        if (this.options.eventType === EventTypes.CONTEXTMENU) {
            evt.stopPropagation();
            evt.preventDefault();
        }

        setTimeout(() => { 
            this.openMenu(evt); 
        });

        evt.target?.addEventListener(
            'pointerdown',
            (event) => {
                if (this.opened) {
                    event.stopPropagation();
                    this.closeMenu();
                }
            },
            { once: true }
        );
    }

    protected openMenu(evt: MouseEvent) {
        if (this.menuEntries.size === 0) return;

        this.opened = true;
        this.positionContainer();
        this.container.classList.remove(CSS_CLASSES.hidden);

        this.dispatchEvent(
            new ContextMenuEvent({
                type: CustomEventTypes.OPEN,
                map: this.map,
                originalEvent: evt
            })
        );
    }

    protected getMenuEntriesLength(): number {
        return Array.from(this.menuEntries).filter(
            ([, v]) => v.isSeparator === false || v.isSubmenu === false
        ).length;
    }

    protected positionContainer() {
        const mapSize = this.map.getSize() || [0, 0];
        const spaceLeft = {
            w: mapSize[0] - this.pixel[0],
            h: mapSize[1] - this.pixel[1],
        };
        const menuSize = {
            w: this.container.offsetWidth,
            // a cheap way to recalculate container height
            // since offsetHeight is like cached
            h: this.container.offsetHeight,
        };

        const left = spaceLeft.w >= menuSize.w ? this.pixel[0] + 5 : this.pixel[0] - menuSize.w;

        this.container.style.left = `${left}px`;
        this.container.style.top =
            spaceLeft.h >= menuSize.h
                ? `${this.pixel[1] - 10}px`
                : `${this.pixel[1] - menuSize.h}px`;
        this.container.style.right = 'auto';
        this.container.style.bottom = 'auto';
        spaceLeft.w -= menuSize.w;

        const containerSubmenuChildren = (container: HTMLUListElement): HTMLLIElement[] =>
            Array.from(container.children).filter(
                (el) => el.tagName === 'LI' && el.classList.contains(CSS_CLASSES.submenu)
            ) as HTMLLIElement[];

        let countSubMenu = 0;
        const positionSubmenu = (container: HTMLUListElement, spaceLeftWidth: number) => {
            countSubMenu += 1;
            const elements = containerSubmenuChildren(container);

            elements.forEach((element) => {
                const lastLeft =
                    spaceLeftWidth >= menuSize.w ? menuSize.w - 8 : (menuSize.w + 8) * -1;

                const submenu = element.querySelector(
                    `ul.${CSS_CLASSES.container}`
                ) as HTMLUListElement;

                const submenuHeight = Math.round(
                    this.lineHeight *
                        Array.from(submenu.children).filter((el) => el.tagName === 'LI').length
                );

                submenu.style.left = `${lastLeft}px`;
                submenu.style.right = 'auto';
                submenu.style.top =
                    spaceLeft.h >= submenuHeight + menuSize.h
                        ? '0'
                        : `-${submenu.offsetHeight - 25}px`;
                submenu.style.bottom = 'auto';
                submenu.style.zIndex = String(countSubMenu);

                if (containerSubmenuChildren(submenu).length > 0) {
                    positionSubmenu(submenu, spaceLeftWidth - menuSize.w);
                }
            });
        };

        positionSubmenu(this.container.firstElementChild as HTMLUListElement, spaceLeft.w);
    }

    protected handleMapMove() {
        this.closeMenu();
    }

    protected handleEntryCallback(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        const target = evt.currentTarget as HTMLLIElement;
        const item = this.menuEntries.get(target.id);

        if (!item) return;

        const object: CallbackObject = {
            coordinate: this.coordinate,
            data: item.data,
        };

        this.closeMenu();
        item.callback?.(object, this.map);
    }

    protected handleAddMenuEntry(item: MenuEntry, element: HTMLLIElement) {
        this.menuEntries.set(item.id, item);

        if ('callback' in item && typeof item.callback === 'function') {
            element.addEventListener('click', this.entryCallbackEventListener, false);
        }
    }
}
