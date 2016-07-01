import * as vars from '../../config/vars.json';
import * as constants from './constants';
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
      vars.namespace + vars.container_class,
      vars.namespace + vars.hidden_class,
      vars.ol_unselectable_class
    ].join(' ');
    container.style.width = parseInt(this.Base.options.width, 10) + 'px';
    return container;
  }
  
  createMenu() {
    let options = this.Base.options, items = [];
    
    if ('items' in options) {
      items = (options.default_items) ?
        options.items.concat(constants.defaultItems) : options.items;
    } else if (options.default_items) {
      items = constants.defaultItems;
    }
    
    // no item
    if(items.length === 0) return false;
    
    // create entries
    items.forEach(this.addMenuEntry, this);
  }
  
  addMenuEntry(item) {
    const $internal = this.Base.constructor.Internal;
    let index = $internal.getNextItemIndex();
    const submenu_class = vars.namespace + vars.submenu_class;
    
    if (item.items && Array.isArray(item.items)) {
      // submenu - only a second level
      item.classname = item.classname || '';
      if (!utils.contains(submenu_class, item.classname)) {
        item.classname = 
          item.classname.length > 0 ? ' ' + submenu_class : submenu_class;
      }
      
      let li = this.generateHtmlAndPublish(this.container, item, index);
      let ul = document.createElement('ul');
      
      ul.className = vars.namespace + vars.container_class;
      ul.style.left = $internal.submenu.last_left || $internal.submenu.left;
      ul.style.width = this.Base.options.width + 'px';
      li.appendChild(ul);
      
      item.items.forEach(each => {
        this.generateHtmlAndPublish(ul, each, $internal.getNextItemIndex(), true);
      });
    } else {
      this.generateHtmlAndPublish(this.container, item, index);
    }
  }
  
  generateHtmlAndPublish(parent, item, index, submenu) {
    let html, frag, element, separator = false;
    const $internal = this.Base.constructor.Internal;
    
    // separator
    if (typeof item === 'string' && item.trim() == '-') {
      html = [
        '<li id="index',
        index,
        '" class="',
        vars.namespace,
        vars.separator_class,
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
      html = '<span>'+ item.text +'</span>';
      frag = utils.createFragment(html);
      element = document.createElement('li');
      
      if (item.icon) {
        if (item.classname === '') {
          item.classname = vars.namespace + vars.icon_class;
        } else if (item.classname.indexOf(vars.namespace + vars.icon_class) === -1) {
          item.classname += ' ' + vars.namespace + vars.icon_class;
        }
        element.setAttribute('style', 'background-image:url('+ item.icon +')');
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
    
    // publish to add listener
    constants.events.publish(constants.eventType.ADD_MENU_ENTRY, {
      index: index,
      element: element
    });
    
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
