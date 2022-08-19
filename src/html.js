/* eslint-disable max-statements */
import { CSS_CLASSES, DEFAULT_ITEMS } from './constants';
import { createFragment, find } from './helpers/dom';
import { contains, getUniqueId } from './helpers/mix';

/**
 * @class Html
 */
export class Html {
    /**
     * @constructor
     * @param {Function} base Base class.
     */
    constructor(base) {
        this.Base = base;
        this.Base.container = this.container = this.createContainer(true);

        return this;
    }

    createContainer(hidden) {
        const container = document.createElement('div');
        const ul = document.createElement('ul');
        const klasses = [CSS_CLASSES.container, CSS_CLASSES.unselectable];

        hidden && klasses.push(CSS_CLASSES.hidden);
        container.className = klasses.join(' ');
        container.style.width = `${Number.parseInt(this.Base.options.width, 10)}px`;
        container.append(ul);

        return container;
    }

    createMenu() {
        let items = [];

        if ('items' in this.Base.options) {
            items = this.Base.options.defaultItems
                ? this.Base.options.items.concat(DEFAULT_ITEMS)
                : this.Base.options.items;
        } else if (this.Base.options.defaultItems) {
            items = DEFAULT_ITEMS;
        }

        // no item
        if (items.length === 0) return false;

        // create entries
        items.forEach(this.addMenuEntry, this);
    }

    addMenuEntry(item) {
        if (item.items && Array.isArray(item.items)) {
            // submenu - only a second level
            item.classname = item.classname || '';
            if (!contains(CSS_CLASSES.submenu, item.classname)) {
                item.classname =
                    item.classname.length > 0 ? ` ${CSS_CLASSES.submenu}` : CSS_CLASSES.submenu;
            }

            const li = this.generateHtmlAndPublish(this.container, item);
            const sub = this.createContainer();

            sub.style.left = this.Base.Internal.submenu.lastLeft || this.Base.Internal.submenu.left;
            li.append(sub);

            item.items.forEach((each) => {
                this.generateHtmlAndPublish(sub, each, true);
            });
        } else {
            this.generateHtmlAndPublish(this.container, item);
        }
    }

    generateHtmlAndPublish(parent, item, submenu) {
        const index = getUniqueId();
        let element;
        let frag;
        let html;
        let separator = false;

        // separator
        if (typeof item === 'string' && item.trim() === '-') {
            html = `<li id="${index}" class="${CSS_CLASSES.separator}"><hr></li>`;
            frag = createFragment(html);
            // http://stackoverflow.com/a/13347298/4640499
            element = Array.prototype.slice.call(frag.childNodes, 0)[0];
            parent.firstChild.append(frag);
            // to exclude from lineHeight calculation
            separator = true;
        } else {
            item.classname = item.classname || '';
            html = `<span>${item.text}</span>`;
            frag = createFragment(html);
            element = document.createElement('li');

            if (item.icon) {
                if (item.classname === '') {
                    item.classname = CSS_CLASSES.icon;
                } else if (!item.classname.includes(CSS_CLASSES.icon)) {
                    item.classname += ` ${CSS_CLASSES.icon}`;
                }

                element.setAttribute('style', `background-image:url(${item.icon})`);
            }

            element.id = index;
            element.className = item.classname;
            element.append(frag);
            parent.firstChild.append(element);
        }

        this.Base.Internal.items[index] = {
            id: index,
            submenu: submenu || 0,
            separator,
            callback: item.callback,
            data: item.data || null,
        };
        this.Base.Internal.setItemListener(element, index);

        return element;
    }

    removeMenuEntry(index) {
        const element = find(`#${index}`, this.container.firstChild);

        element && this.container.firstChild.removeChild(element);
        delete this.Base.Internal.items[index];
    }

    cloneAndGetLineHeight() {
        // for some reason I have to calculate with 2 items
        const cloned = this.container.cloneNode();
        const frag = createFragment('<span>Foo</span>');
        const frag2 = createFragment('<span>Foo</span>');
        const element = document.createElement('li');
        const element2 = document.createElement('li');

        element.append(frag);
        element2.append(frag2);
        cloned.append(element);
        cloned.append(element2);

        this.container.parentNode.append(cloned);
        const height = cloned.offsetHeight / 2;

        this.container.parentNode.removeChild(cloned);

        return height;
    }
}
