import { CSS_CLASSES } from '../constants';
import { CustomEventTypes, Item, MenuEntry } from '../types';
import emitter from '../emitter';

export function createFragment(html: string): DocumentFragment {
    const fragment = document.createDocumentFragment();
    const div = document.createElement('div');

    // eslint-disable-next-line no-unsanitized/property
    div.innerHTML = html;

    while (div.firstChild) {
        fragment.append(div.firstChild);
    }

    return fragment;
}

export function getLineHeight(container: HTMLDivElement): number {
    const cloned = document.importNode(container);
    const width = container.offsetWidth;

    cloned.style.cssText = `position: fixed; top: 0; left: 0; overflow: auto; visibility: hidden; pointer-events: none; height: unset; max-height: unset; width: ${width}px`;

    const frag = createFragment('<span>Foo</span>');
    const frag2 = createFragment('<span>Foo</span>');
    const element = document.createElement('li');
    const element2 = document.createElement('li');

    element.append(frag);
    element2.append(frag2);
    cloned.append(element);
    cloned.append(element2);
    container.parentNode?.append(cloned);

    const height = cloned.offsetHeight / 2;

    container.parentNode?.removeChild(cloned);

    return height;
}

export function addMenuEntry(
    parentNode: HTMLUListElement,
    item: Item,
    isSubmenu = false,
    isInsideSubmenu = false
): HTMLLIElement {
    const id = `_${Math.random().toString(36).slice(2, 11)}`;

    if (typeof item !== 'string' && 'text' in item) {
        const html = `<span>${item.text}</span>`;
        const frag = createFragment(html);
        const element = document.createElement('li');

        item.classname = item.classname || '';

        if (item.icon) {
            if (item.classname === '') {
                item.classname = CSS_CLASSES.icon;
            } else if (item.classname.includes(CSS_CLASSES.icon) === false) {
                item.classname += ` ${CSS_CLASSES.icon}`;
            }

            element.setAttribute('style', `background-image:url(${item.icon})`);
        }

        element.id = id;
        element.className = item.classname;
        element.append(frag);
        parentNode.append(element);

        const entry: MenuEntry = {
            id,
            isSubmenu,
            isInsideSubmenu,
            isSeparator: false,
            callback: 'callback' in item ? item.callback : null,
            data: 'data' in item ? item.data : null,
        };

        emitter.emit(CustomEventTypes.ADD_MENU_ENTRY, entry, element);

        return element;
    }

    const html = `<li id="${id}" class="${CSS_CLASSES.separator}"><hr></li>`;
    const frag = createFragment(html);

    parentNode.append(frag);

    const element = parentNode.lastChild as HTMLLIElement;
    const entry: MenuEntry = {
        id,
        isSubmenu: false,
        isInsideSubmenu: false,
        isSeparator: true,
        callback: null,
        data: null,
    };

    emitter.emit(CustomEventTypes.ADD_MENU_ENTRY, entry, element);

    return element;
}

export function addMenuEntries(
    container: HTMLUListElement,
    items: Item[],
    menuWidth: number,
    isInsideSubmenu?: boolean
) {
    items.forEach((item) => {
        if (typeof item !== 'string' && 'items' in item && Array.isArray(item.items)) {
            const li = addMenuEntry(container, item, true);

            li.classList.add(CSS_CLASSES.submenu);
            const ul = document.createElement('ul');

            ul.classList.add(CSS_CLASSES.container);
            ul.style.width = `${menuWidth}px`;

            li.append(ul);

            addMenuEntries(ul, item.items, menuWidth, true);
        } else {
            addMenuEntry(container, item, false, isInsideSubmenu);
        }
    });
}
