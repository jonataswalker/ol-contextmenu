import type { Pixel } from 'ol/pixel';
import type { Coordinate } from 'ol/coordinate';
import Control from 'ol/control/Control';
import OlMap from 'ol/Map';
import BaseEvent from 'ol/events/Event';
import { el, setAttr } from 'redom';

import { CSS_CLASSES, DEFAULT_ITEMS, DEFAULT_OPTIONS } from './constants';
import { CallbackObject, CustomEventTypes, EventTypes, Item, MenuEntry, Options } from './types';
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

    protected mapMoveListener: () => void;

    protected lineHeight = 0;

    protected disabled: boolean;

    protected opened: boolean;

    protected items: Item[] = [];

    protected menuEntries: Record<string, MenuEntry> = {};

    options: Options;

    constructor(opts: Partial<Options> = {}) {
        assert(typeof opts === 'object', '@param `opts` should be object type!');

        const container = el('div', el('ul'));

        super({ element: container });

        this.options = { ...DEFAULT_OPTIONS, ...opts };

        setAttr(container, {
            style: { width: `${this.options.width}px` },
            className: [CSS_CLASSES.container, CSS_CLASSES.unselectable, CSS_CLASSES.hidden].join(
                ' '
            ),
        });

        this.container = container;
        this.contextMenuEventListener = (evt: MouseEvent) => {
            this.handleContextMenu(evt);
        };
        this.mapMoveListener = () => {
            this.handleMapMove();
        };
        this.disabled = false;
        this.opened = false;

        emitter.on(
            CustomEventTypes.ADD_MENU_ENTRY,
            (item: MenuEntry, element: HTMLLIElement) => {
                console.log('emitter.on', { item });

                this.handleAddMenuEntry(item, element);
            },
            this
        );
    }

    clear() {
        console.log('hey');
    }

    enable() {
        this.disabled = false;
    }

    disable() {
        this.disabled = true;
    }

    closeMenu() {
        this.opened = false;
        this.container.classList.add(CSS_CLASSES.hidden);
        this.dispatchEvent(CustomEventTypes.CLOSE);
    }

    isOpen() {
        return this.opened;
    }

    setMap(map: OlMap): void {
        super.setMap(map);

        if (map) {
            this.map = map;
            const mapSize = map.getSize();

            console.log('setMap', { mapSize, map });

            this.map
                .getViewport()
                .addEventListener(this.options.eventType, this.contextMenuEventListener, false);

            this.map.on('movestart', () => {
                this.handleMapMove();
            });

            this.items = this.options.defaultItems
                ? this.options.items.concat(DEFAULT_ITEMS)
                : this.options.items;

            addMenuEntries(this.container.firstChild as HTMLUListElement, this.items);

            const entriesLength = this.getMenuEntriesLength();

            this.lineHeight =
                entriesLength > 0
                    ? this.container.offsetHeight / entriesLength
                    : getLineHeight(this.container);
        } else {
            this.removeListeners();
        }
    }

    protected removeListeners() {
        this.map
            .getViewport()
            .removeEventListener(this.options.eventType, this.contextMenuEventListener, false);
    }

    protected handleContextMenu(evt: MouseEvent) {
        this.coordinate = this.map.getEventCoordinate(evt);
        this.pixel = this.map.getEventPixel(evt);
        this.dispatchEvent({
            type: CustomEventTypes.BEFOREOPEN,
            pixel: this.pixel,
            coordinate: this.coordinate,
        } as unknown as BaseEvent);

        if (this.disabled) return;

        if (this.options.eventType === EventTypes.CONTEXTMENU) {
            evt.stopPropagation();
            evt.preventDefault();
        }

        this.openMenu();

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

    protected openMenu() {
        this.opened = true;
        this.positionContainer();
        this.container.classList.remove(CSS_CLASSES.hidden);

        console.log('openMenu', this.pixel, this.container);
    }

    protected getMenuEntriesLength(): number {
        return Object.keys(this.menuEntries).filter(
            (key) => !this.menuEntries[key].isSeparator || !this.menuEntries[key].isSubmenu
        ).length;
    }

    protected positionContainer() {
        const mapSize = this.map.getSize() || [0, 0];
        const spaceLeft = {
            w: mapSize[1] - this.pixel[1],
            h: mapSize[0] - this.pixel[0],
        };
        const menuSize = {
            w: this.container.offsetWidth,
            // a cheap way to recalculate container height
            // since offsetHeight is like cached
            h: Math.round(this.lineHeight * this.getMenuEntriesLength()),
        };

        console.log({ spaceLeft, menuSize, mapSize });

        if (spaceLeft.w >= menuSize.w) {
            this.container.style.right = 'auto';
            this.container.style.left = `${this.pixel[0] + 5}px`;
        } else {
            this.container.style.left = 'auto';
            this.container.style.right = '15px';
        }

        if (spaceLeft.h >= menuSize.h) {
            this.container.style.bottom = 'auto';
            this.container.style.top = `${this.pixel[1] - 10}px`;
        } else {
            this.container.style.top = 'auto';
            this.container.style.bottom = '0';
        }
    }

    protected handleMapMove() {
        this.closeMenu();
    }

    protected handleAddMenuEntry(item: MenuEntry, element: HTMLLIElement) {
        console.log('handleAddMenuEntry', { item });

        this.menuEntries[item.id] = item;

        if ('callback' in item && typeof item.callback === 'function') {
            element.addEventListener(
                'click',
                (evt) => {
                    evt.preventDefault();
                    const object: CallbackObject = {
                        coordinate: this.coordinate,
                        data: item.data,
                    };

                    this.closeMenu();
                    item.callback?.(object, this.map);
                },
                false
            );
        }
    }
}

// Expose LayerSwitcher as ol.control.LayerSwitcher if using a full build of
// OpenLayers
if (window.ol && window.ol.control) {
    window.ol.control.LayerSwitcher = ContextMenu;
}
