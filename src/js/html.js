import { CLASSNAME, defaultItems as DEFAULT_ITEMS } from './constants';
import utils from './utils';


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

  createContainer() {
    let container = document.createElement('ul');
    container.className = [
      CLASSNAME.container,
      CLASSNAME.hidden,
      CLASSNAME.OL_unselectable
    ].join(' ');
    container.style.width = parseInt(this.Base.options.width, 10) + 'px';
    return container;
  }

  createMenu() {
    let options = this.Base.options, items = [];

    if ('items' in options) {
      items = (options.defaultItems) ?
          options.items.concat(DEFAULT_ITEMS) : options.items;
    } else if (options.defaultItems) {
      items = DEFAULT_ITEMS;
    }
    // no item
    if (items.length === 0) return false;
    // create entries
    items.forEach(this.addMenuEntry, this);
  }

  addMenuEntry(item) {
    const $internal = this.Base.constructor.Internal;
    let index = $internal.getNextItemIndex();
    const submenu_class = CLASSNAME.submenu;

    if (item.items && Array.isArray(item.items)) {
      // submenu - only a second level
      item.classname = item.classname || '';
      if (!utils.contains(submenu_class, item.classname)) {
        item.classname =
          item.classname.length > 0 ? ' ' + submenu_class : submenu_class;
      }

      let li = this.generateHtmlAndPublish(this.container, item, index);
      let ul = document.createElement('ul');

      ul.className = CLASSNAME.container;
      ul.style.left = $internal.submenu.last_left || $internal.submenu.left;
      ul.style.width = this.Base.options.width + 'px';
      li.appendChild(ul);

      item.items.forEach(each => {
        this.generateHtmlAndPublish(
            ul, each, $internal.getNextItemIndex(), true);
      });
    } else {
      this.generateHtmlAndPublish(this.container, item, index);
    }
  }

  generateHtmlAndPublish(parent, item, index, submenu) {
    let html, frag, element, separator = false;
    const $internal = this.Base.constructor.Internal;

    // separator
    if (typeof item === 'string' && item.trim() === '-') {
      html = [
        '<li id="index', index,
        '" class="', CLASSNAME.separator,
        '"><hr></li>'
      ].join('');
      frag = utils.createFragment(html);
      // http://stackoverflow.com/a/13347298/4640499
      element = [].slice.call(frag.childNodes, 0)[0];
      parent.appendChild(frag);
      // to exclude from lineHeight calculation
      separator = true;
    } else {
      item.classname = item.classname || '';
      html = '<span>' + item.text + '</span>';
      frag = utils.createFragment(html);
      element = document.createElement('li');

      if (item.icon) {
        if (item.classname === '') {
          item.classname = CLASSNAME.icon;
        } else if (item.classname.indexOf(CLASSNAME.icon) === -1) {
          item.classname += ' ' + CLASSNAME.icon;
        }
        element.setAttribute(
            'style', 'background-image:url(' + item.icon + ')');
      }

      element.id = 'index' + index;
      element.className = item.classname;
      element.appendChild(frag);
      parent.appendChild(element);
    }

    $internal.items[index] = {
      id: index,
      submenu: submenu || 0,
      separator: separator,
      callback: item.callback,
      data: item.data || null
    };

    $internal.setItemListener(element, index);

    return element;
  }

  removeMenuEntry(index) {
    const element = utils.find('#index' + index, this.container);
    if (element) {
      this.container.removeChild(element);
    }
    delete this.Base.constructor.Internal.items[index];
  }

  cloneAndGetLineHeight() {
    // for some reason I have to calculate with 2 items
    const cloned = this.container.cloneNode();
    const frag = utils.createFragment('<span>Foo</span>');
    const frag2 = utils.createFragment('<span>Foo</span>');
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
