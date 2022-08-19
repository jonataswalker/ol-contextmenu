import Control from 'ol/control/Control';
import { Map as OlMap } from 'ol';
import { el, setAttr } from 'redom';
import { CSS_CLASSES, DEFAULT_OPTIONS } from './constants';
import { CustomEventTypes, EventTypes } from './types';
import './sass/main.scss';
function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}
export default class ContextMenu extends Control {
    constructor(constructorOptions = {}) {
        assert(typeof constructorOptions === 'object', '@param `constructorOptions` should be object type!');
        const container = el('div', el('ul'));
        super({ element: container });
        Object.defineProperty(this, "map", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new OlMap({})
        });
        Object.defineProperty(this, "container", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "coordinate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "pixel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "contextMenuEventListener", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mapMoveListener", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "disabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "opened", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.options = Object.assign(Object.assign({}, DEFAULT_OPTIONS), constructorOptions);
        setAttr(container, {
            style: { width: `${this.options.width}px` },
            className: [CSS_CLASSES.container, CSS_CLASSES.unselectable, CSS_CLASSES.hidden].join(' '),
        });
        this.container = container;
        this.contextMenuEventListener = (evt) => {
            this.handleContextMenu(evt);
        };
        this.mapMoveListener = () => {
            this.handleMapMove();
        };
        this.disabled = false;
        this.opened = false;
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
    }
    isOpen() {
        return this.opened;
    }
    setMap(map) {
        super.setMap(map);
        if (map) {
            this.map = map;
            map.getViewport().addEventListener(this.options.eventType, this.contextMenuEventListener, false);
            map.on('movestart', () => {
                this.handleMapMove();
            });
        }
        else {
            this.removeListeners();
        }
    }
    removeListeners() {
        this.map
            .getViewport()
            .removeEventListener(this.options.eventType, this.contextMenuEventListener, false);
    }
    handleContextMenu(evt) {
        this.coordinate = this.map.getEventCoordinate(evt);
        this.pixel = this.map.getEventPixel(evt);
        this.dispatchEvent({
            type: CustomEventTypes.BEFOREOPEN,
            pixel: this.pixel,
            coordinate: this.coordinate,
        });
        if (this.disabled)
            return;
        if (this.options.eventType === EventTypes.CONTEXTMENU) {
            evt.stopPropagation();
            evt.preventDefault();
        }
        this.openMenu();
    }
    openMenu() {
        this.container.classList.remove(CSS_CLASSES.hidden);
        console.log('openMenu', this.pixel, this.container);
    }
    handleMapMove() {
        this.closeMenu();
    }
}
//# sourceMappingURL=main.js.map