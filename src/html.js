import { CLASSNAME, DEFAULT_ITEMS } from 'konstants';
import { createFragment, find } from 'helpers/dom';
import { contains, getUniqueId } from 'helpers/mix';

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
    this.Base.container = this.container = this.createContainer();
    return this;
  }

  createContainer(hidden) {
    const container = document.createElement('div');
    const ul = document.createElement('ul');
    const klasses = [CLASSNAME.container, CLASSNAME.OL_unselectable];

    hidden && klasses.push(CLASSNAME.hidden);
    container.className = klasses.join(' ');
    container.style.width = parseInt(this.Base.options.width, 10) + 'px';
    container.appendChild(ul);
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
      if (!contains(CLASSNAME.submenu, item.classname)) {
        item.classname = item.classname.length
          ? ' ' + CLASSNAME.submenu
          : CLASSNAME.submenu;
      }

      let li = this.generateHtmlAndPublish(this.container, item);
      let sub = this.createContainer();
      sub.style.left =
        this.Base.Internal.submenu.lastLeft || this.Base.Internal.submenu.left;
      li.appendChild(sub);

      item.items.forEach(each => {
        this.generateHtmlAndPublish(sub, each, true);
      });
    } else {
      this.generateHtmlAndPublish(this.container, item);
    }
  }

  generateHtmlAndPublish(parent, item, submenu) {
    let html,
        frag,
        element,
        separator = false;
    const index = getUniqueId();

    // separator
    if (typeof item === 'string' && item.trim() === '-') {
      html = [
        '<li id="',
        index,
        '" class="',
        CLASSNAME.separator,
        '">',
        '<hr></li>',
      ].join('');
      frag = createFragment(html);
      // http://stackoverflow.com/a/13347298/4640499
      element = [].slice.call(frag.childNodes, 0)[0];
      parent.firstChild.appendChild(frag);
      // to exclude from lineHeight calculation
      separator = true;
    } else {
      item.classname = item.classname || '';
      html = '<span>' + item.text + '</span>';
      frag = createFragment(html);
      element = document.createElement('li');

      if (item.icon) {
        if (item.classname === '') {
          item.classname = CLASSNAME.icon;
        } else if (item.classname.indexOf(CLASSNAME.icon) === -1) {
          item.classname += ' ' + CLASSNAME.icon;
        }
        element.setAttribute('style', `background-image:url(${item.icon})`);
      }

      element.id = index;
      element.className = item.classname;
      element.appendChild(frag);
      parent.firstChild.appendChild(element);
    }

    this.Base.Internal.items[index] = {
      id: index,
      submenu: submenu || 0,
      separator: separator,
      callback: item.callback,
      data: item.data || null,
    };
    this.Base.Internal.setItemListener(element, index);
    return element;
  }

  removeMenuEntry(index) {
    const element = find('#' + index, this.container.firstChild);
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

    element.appendChild(frag);
    element2.appendChild(frag2);
    cloned.appendChild(element);
    cloned.appendChild(element2);

    this.container.parentNode.appendChild(cloned);
    const height = cloned.offsetHeight / 2;
    this.container.parentNode.removeChild(cloned);
    return height;
  }
}
