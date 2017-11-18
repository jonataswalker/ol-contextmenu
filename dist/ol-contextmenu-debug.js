/*!
 * ol-contextmenu - v3.1.0
 * Custom Context Menu for Openlayers
 * https://github.com/jonataswalker/ol-contextmenu
 * Built: Sat Nov 18 2017 09:49:39 GMT-0200 (-02)
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('openlayers')) :
	typeof define === 'function' && define.amd ? define(['openlayers'], factory) :
	(global.ContextMenu = factory(global.ol));
}(this, (function (ol) { 'use strict';

ol = ol && ol.hasOwnProperty('default') ? ol['default'] : ol;

var namespace = "ol-ctx-menu";
var container_class = "-container";
var separator_class = "-separator";
var submenu_class = "-submenu";
var hidden_class = "-hidden";
var icon_class = "-icon";
var zoom_in_class = "-zoom-in";
var zoom_out_class = "-zoom-out";
var ol_unselectable_class = "ol-unselectable";
var vars = {
	namespace: namespace,
	container_class: container_class,
	separator_class: separator_class,
	submenu_class: submenu_class,
	hidden_class: hidden_class,
	icon_class: icon_class,
	zoom_in_class: zoom_in_class,
	zoom_out_class: zoom_out_class,
	ol_unselectable_class: ol_unselectable_class
};

var _VARS_ = Object.freeze({
	namespace: namespace,
	container_class: container_class,
	separator_class: separator_class,
	submenu_class: submenu_class,
	hidden_class: hidden_class,
	icon_class: icon_class,
	zoom_in_class: zoom_in_class,
	zoom_out_class: zoom_out_class,
	ol_unselectable_class: ol_unselectable_class,
	default: vars
});

const VARS = _VARS_;

const EVENT_TYPE = {
  /**
   * Triggered before context menu is openned.
   */
  BEFOREOPEN: 'beforeopen',
  /**
   * Triggered when context menu is openned.
   */
  OPEN: 'open',
  /**
   * Triggered when context menu is closed.
   */
  CLOSE: 'close',
  /**
   * Internal. Triggered when a menu entry is added.
   */
  ADD_MENU_ENTRY: 'add-menu-entry',
  /**
   * Internal.
   */
  CONTEXTMENU: 'contextmenu',
  /**
   * Internal.
   */
  HOVER: 'mouseover'
};

/**
 * DOM Elements classname
 */
const CLASSNAME = {
  container       : VARS.namespace + VARS.container_class,
  separator       : VARS.namespace + VARS.separator_class,
  submenu         : VARS.namespace + VARS.submenu_class,
  hidden          : VARS.namespace + VARS.hidden_class,
  icon            : VARS.namespace + VARS.icon_class,
  zoomIn          : VARS.namespace + VARS.zoom_in_class,
  zoomOut         : VARS.namespace + VARS.zoom_out_class,
  OL_unselectable : VARS.ol_unselectable_class
};


const DEFAULT_OPTIONS = {
  width: 150,
  scrollAt: 4,
  eventType: EVENT_TYPE.CONTEXTMENU,
  defaultItems: true
};

const DEFAULT_ITEMS = [
  {
    text: 'Zoom In',
    classname: ((CLASSNAME.zoomIn) + " " + (CLASSNAME.icon)),
    callback: function (obj, map) {
      const view = map.getView();
      view.animate({
        zoom: +view.getZoom() + 1,
        duration: 700,
        center: obj.coordinate
      });
    }
  },
  {
    text: 'Zoom Out',
    classname: ((CLASSNAME.zoomOut) + " " + (CLASSNAME.icon)),
    callback: function (obj, map) {
      const view = map.getView();
      view.animate({
        zoom: +view.getZoom() - 1,
        duration: 700,
        center: obj.coordinate
      });
    }
  }
];

/**
  * Overwrites obj1's values with obj2's and adds
  * obj2's if non existent in obj1
  * @returns obj3 a new object based on obj1 and obj2
  */
function mergeOptions(obj1, obj2) {
  let obj3 = {};
  for (let attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
  for (let attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
  return obj3;
}

function assert(condition, message) {
  if ( message === void 0 ) message = 'Assertion failed';

  if (!condition) {
    if (typeof Error !== 'undefined') { throw new Error(message); }
    throw message; // Fallback
  }
}

/**
 * Does str contain test?
 * @param {String} str_test
 * @param {String} str
 * @returns Boolean
 */
function contains(str_test, str) {
  return !!~str.indexOf(str_test);
}

function getUniqueId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function isDefAndNotNull(val) {
  // Note that undefined == null.
  return val != null; // eslint-disable-line no-eq-null
}







function isNumeric(str) {
  return /^\d+$/.test(str);
}

/**
 * @param {Element|Array<Element>} element DOM node or array of nodes.
 * @param {String|Array<String>} classname Class or array of classes.
 * For example: 'class1 class2' or ['class1', 'class2']
 * @param {Number|undefined} timeout Timeout to remove a class.
 */
function addClass(element, classname, timeout) {
  if (Array.isArray(element)) {
    element.forEach(function (each) { return addClass(each, classname); });
    return;
  }

  const array = (Array.isArray(classname))
    ? classname
    : classname.split(/\s+/);
  let i = array.length;

  while (i--) {
    if (!hasClass(element, array[i])) {
      _addClass(element, array[i], timeout);
    }
  }
}

/**
 * @param {Element|Array<Element>} element DOM node or array of nodes.
 * @param {String|Array<String>} classname Class or array of classes.
 * For example: 'class1 class2' or ['class1', 'class2']
 * @param {Number|undefined} timeout Timeout to add a class.
 */
function removeClass(element, classname, timeout) {
  if (Array.isArray(element)) {
    element.forEach(function (each) { return removeClass(each, classname, timeout); });
    return;
  }

  const array = (Array.isArray(classname))
    ? classname
    : classname.split(/\s+/);
  let i = array.length;

  while (i--) {
    if (hasClass(element, array[i])) {
      _removeClass(element, array[i], timeout);
    }
  }
}


/**
 * @param {Element} element DOM node.
 * @param {String} classname Classname.
 * @return {Boolean}
 */
function hasClass(element, c) {
  // use native if available
  return element.classList
    ? element.classList.contains(c)
    : classRegex(c).test(element.className);
}

/**
 * @param {Element|Array<Element>} element DOM node or array of nodes.
 * @param {String} classname Classe.
 */


/**
 * Abstraction to querySelectorAll for increased
 * performance and greater usability
 * @param {String} selector
 * @param {Element} context (optional)
 * @param {Boolean} find_all (optional)
 * @return (find_all) {Element} : {Array}
 */
function find(selector, context, find_all) {
  if ( context === void 0 ) context = window.document;

  let simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/,
      periodRe = /\./g,
      slice = Array.prototype.slice,
      matches = [];

  // Redirect call to the more performant function
  // if it's a simple selector and return an array
  // for easier usage
  if (simpleRe.test(selector)) {
    switch (selector[0]) {
      case '#':
        matches = [$(selector.substr(1))];
        break;
      case '.':
        matches = slice.call(context.getElementsByClassName(
          selector.substr(1).replace(periodRe, ' ')));
        break;
      default:
        matches = slice.call(context.getElementsByTagName(selector));
    }
  } else {
    // If not a simple selector, query the DOM as usual
    // and return an array for easier usage
    matches = slice.call(context.querySelectorAll(selector));
  }

  return (find_all) ? matches : matches[0];
}

function $(id) {
  id = (id[0] === '#') ? id.substr(1, id.length) : id;
  return document.getElementById(id);
}



function offset(element) {
  const rect = element.getBoundingClientRect();
  const docEl = document.documentElement;
  return {
    left: rect.left + window.pageXOffset - docEl.clientLeft,
    top: rect.top + window.pageYOffset - docEl.clientTop,
    width: element.offsetWidth,
    height: element.offsetHeight
  };
}

function getViewportSize() {
  return {
    w: window.innerWidth || document.documentElement.clientWidth,
    h: window.innerHeight || document.documentElement.clientHeight
  };
}









function createFragment(html) {
  let frag = document.createDocumentFragment(),
      temp = document.createElement('div');
  temp.innerHTML = html;
  while (temp.firstChild) {
    frag.appendChild(temp.firstChild);
  }
  return frag;
}







function classRegex(classname) {
  return new RegExp(("(^|\\s+) " + classname + " (\\s+|$)"));
}

function _addClass(el, klass, timeout) {
  // use native if available
  if (el.classList) {
    el.classList.add(klass);
  } else {
    el.className = (el.className + ' ' + klass).trim();
  }

  if (timeout && isNumeric(timeout)) {
    window.setTimeout(function () { return _removeClass(el, klass); }, timeout);
  }
}

function _removeClass(el, klass, timeout) {
  if (el.classList) {
    el.classList.remove(klass);
  } else {
    el.className = (el.className.replace(classRegex(klass), ' ')).trim();
  }
  if (timeout && isNumeric(timeout)) {
    window.setTimeout(function () { return _addClass(el, klass); }, timeout);
  }
}

/**
 * @class Internal
 */
var Internal = function Internal(base) {
  /**
  * @type {ol.control.Control}
  */
  this.Base = base;
  /**
    * @type {ol.Map}
    */
  this.map = undefined;
  /**
    * @type {Element}
    */
  this.viewport = undefined;
  /**
    * @type {ol.Coordinate}
    */
  this.coordinateClicked = undefined;
  /**
    * @type {ol.Pixel}
    */
  this.pixelClicked = undefined;
  /**
    * @type {Number}
    */
  this.lineHeight = 0;
  /**
    * @type {Object}
    */
  this.items = {};
  /**
    * @type {Boolean}
    */
  this.opened = false;
  /**
    * @type {Object}
    */
  this.submenu = {
    left: base.options.width - 15 + 'px',
    lastLeft: '' // string + px
  };
  /**
    * @type {Function}
    */
  this.eventHandler = this.handleEvent.bind(this);
  return this;
};

Internal.prototype.init = function init (map) {
  this.map = map;
  this.viewport = map.getViewport();
  this.setListeners();
  this.Base.Html.createMenu();

  this.lineHeight = this.getItemsLength() > 0
    ? this.Base.container.offsetHeight / this.getItemsLength()
    : this.Base.Html.cloneAndGetLineHeight();
};

Internal.prototype.getItemsLength = function getItemsLength () {
    var this$1 = this;

  let count = 0;
  Object.keys(this.items).forEach(function (k) {
    if (this$1.items[k].submenu || this$1.items[k].separator) { return; }
    count++;
  });
  return count;
};

Internal.prototype.getPixelClicked = function getPixelClicked () {
  return this.pixelClicked;
};

Internal.prototype.getCoordinateClicked = function getCoordinateClicked () {
  return this.coordinateClicked;
};

Internal.prototype.positionContainer = function positionContainer (pixel) {
    var this$1 = this;

  const container = this.Base.container;
  const mapSize = this.map.getSize();
  // how much (width) space left over
  const space_left_h = mapSize[1] - pixel[1];
  // how much (height) space left over
  const space_left_w = mapSize[0] - pixel[0];

  const menuSize = {
    w: container.offsetWidth,
    // a cheap way to recalculate container height
    // since offsetHeight is like cached
    h: Math.round(this.lineHeight * this.getItemsLength())
  };
      // submenus
  const subs = find(("li." + (CLASSNAME.submenu) + ">div"), container, true);

  if (space_left_w >= menuSize.w) {
    container.style.right = 'auto';
    container.style.left = (pixel[0] + 5) + "px";
  } else {
    container.style.left = 'auto';
    container.style.right = '15px';
  }
  // set top or bottom
  if (space_left_h >= menuSize.h) {
    container.style.bottom = 'auto';
    container.style.top = (pixel[1] - 10) + "px";
  } else {
    container.style.top = 'auto';
    container.style.bottom = 0;
  }

  removeClass(container, CLASSNAME.hidden);

  if (subs.length) {
    if (space_left_w < (menuSize.w * 2)) {
      // no space (at right) for submenu
      // position them at left
      this.submenu.lastLeft = "-" + (menuSize.w) + "px";
    } else {
      this.submenu.lastLeft = this.submenu.left;
    }
    subs.forEach(function (sub) {
      // is there enough space for submenu height?
      const viewport = getViewportSize();
      const sub_offset = offset(sub);
      const sub_height = sub_offset.height;
      let sub_top = space_left_h - sub_height;

      if (sub_top < 0) {
        sub_top = sub_height - (viewport.h - sub_offset.top);
        sub.style.top = "-" + sub_top + "px";
      }
      sub.style.left = this$1.submenu.lastLeft;
    });
  }
};

Internal.prototype.openMenu = function openMenu (pixel, coordinate) {
  this.Base.dispatchEvent({
    type: EVENT_TYPE.OPEN,
    pixel: pixel,
    coordinate: coordinate
  });
  this.opened = true;
  this.positionContainer(pixel);
};

Internal.prototype.closeMenu = function closeMenu () {
  this.opened = false;
  addClass(this.Base.container, CLASSNAME.hidden);
  this.Base.dispatchEvent({
    type: EVENT_TYPE.CLOSE
  });
};

Internal.prototype.setListeners = function setListeners () {
  this.viewport.addEventListener(
    this.Base.options.eventType, this.eventHandler, false);
};

Internal.prototype.removeListeners = function removeListeners () {
  this.viewport.removeEventListener(
    this.Base.options.eventType, this.eventHandler, false);
};

Internal.prototype.handleEvent = function handleEvent (evt) {
  const this_ = this;

  this.coordinateClicked = this.map.getEventCoordinate(evt);
  this.pixelClicked = this.map.getEventPixel(evt);

  this.Base.dispatchEvent({
    type: EVENT_TYPE.BEFOREOPEN,
    pixel: this.pixelClicked,
    coordinate: this.coordinateClicked
  });

  if (this.Base.disabled) { return; }

  if (this.Base.options.eventType === EVENT_TYPE.CONTEXTMENU) {
    // don't be intrusive with other event types
    evt.stopPropagation();
    evt.preventDefault();
  }

  this.openMenu(this.pixelClicked, this.coordinateClicked);

  //one-time fire
  evt.target.addEventListener('mousedown', {
    handleEvent: function (e) {
      this_.closeMenu();
      evt.target.removeEventListener(e.type, this, false);
    }
  }, false);
};

Internal.prototype.setItemListener = function setItemListener (li, index) {
  const this_ = this;
  if (li && typeof this.items[index].callback === 'function') {
    (function (callback) {
      li.addEventListener('click', function (evt) {
        evt.preventDefault();
        const obj = {
          coordinate: this_.getCoordinateClicked(),
          data: this_.items[index].data || null
        };
        this_.closeMenu();
        callback(obj, this_.map);
      }, false);
    })(this.items[index].callback);
  }
};

/**
 * @class Html
 */
var Html = function Html(base) {
  this.Base = base;
  this.Base.container = this.container = this.createContainer();
  return this;
};

Html.prototype.createContainer = function createContainer (hidden) {
  const container = document.createElement('div');
  const ul = document.createElement('ul');
  const klasses =[CLASSNAME.container, CLASSNAME.OL_unselectable];

  hidden && klasses.push(CLASSNAME.hidden);
  container.className = klasses.join(' ');
  container.style.width = parseInt(this.Base.options.width, 10) + 'px';
  container.appendChild(ul);
  return container;
};

Html.prototype.createMenu = function createMenu () {
  let items = [];

  if ('items' in this.Base.options) {
    items = this.Base.options.defaultItems
      ? this.Base.options.items.concat(DEFAULT_ITEMS)
      : this.Base.options.items;
  } else if (this.Base.options.defaultItems) {
    items = DEFAULT_ITEMS;
  }
  // no item
  if (items.length === 0) { return false; }
  // create entries
  items.forEach(this.addMenuEntry, this);
};

Html.prototype.addMenuEntry = function addMenuEntry (item) {
    var this$1 = this;

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
    sub.style.left = this.Base.Internal.submenu.lastLeft ||
        this.Base.Internal.submenu.left;
    li.appendChild(sub);

    item.items.forEach(function (each) {
      this$1.generateHtmlAndPublish(sub, each, true);
    });
  } else {
    this.generateHtmlAndPublish(this.container, item);
  }
};

Html.prototype.generateHtmlAndPublish = function generateHtmlAndPublish (parent, item, submenu) {
  let html, frag, element, separator = false;
  const index = getUniqueId();

  // separator
  if (typeof item === 'string' && item.trim() === '-') {
    html = [
      '<li id="', index, '" class="', CLASSNAME.separator, '">',
      '<hr></li>'
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
      element.setAttribute('style', ("background-image:url(" + (item.icon) + ")"));
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
    data: item.data || null
  };
  this.Base.Internal.setItemListener(element, index);
  return element;
};

Html.prototype.removeMenuEntry = function removeMenuEntry (index) {
  const element = find('#' + index, this.container.firstChild);
  element && this.container.firstChild.removeChild(element);
  delete this.Base.Internal.items[index];
};

Html.prototype.cloneAndGetLineHeight = function cloneAndGetLineHeight () {
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
};

/**
 * @class Base
 * @extends {ol.control.Control}
 */
var Base = (function (superclass) {
  function Base(opt_options) {
    if ( opt_options === void 0 ) opt_options = {};

    assert(
      typeof opt_options == 'object',
      '@param `opt_options` should be object type!'
    );

    this.options = mergeOptions(DEFAULT_OPTIONS, opt_options);
    this.disabled = false;

    this.Internal = new Internal(this);
    this.Html = new Html(this);

    superclass.call(this, { element: this.container });
  }

  if ( superclass ) Base.__proto__ = superclass;
  Base.prototype = Object.create( superclass && superclass.prototype );
  Base.prototype.constructor = Base;

  /**
   * Remove all elements from the menu.
   */
  Base.prototype.clear = function clear () {
    Object.keys(this.Internal.items)
      .forEach(this.Html.removeMenuEntry, this.Html);
  };

  /**
   * Close the menu programmatically.
   */
  Base.prototype.close = function close () {
    this.Internal.closeMenu();
  };

  /**
   * Enable menu
   */
  Base.prototype.enable = function enable () {
    this.disabled = false;
  };

  /**
   * Disable menu
   */
  Base.prototype.disable = function disable () {
    this.disabled = true;
  };

  /**
   * @return {Array} Returns default items
   */
  Base.prototype.getDefaultItems = function getDefaultItems () {
    return DEFAULT_ITEMS;
  };

  /**
   * @return {Number} Returns how many items
   */
  Base.prototype.countItems = function countItems () {
    return Object.keys(this.Internal.items).length;
  };

  /**
   * Add items to the menu. This pushes each item in the provided array
   * to the end of the menu.
   * @param {Array} arr Array.
   */
  Base.prototype.extend = function extend (arr) {
    assert(Array.isArray(arr), '@param `arr` should be an Array.');
    arr.forEach(this.push, this);
  };

  Base.prototype.isOpen = function isOpen () {
    return this.Internal.opened;
  };

  /**
   * Update the menu's position.
   */
  Base.prototype.updatePosition = function updatePosition (pixel) {
    assert(Array.isArray(pixel), '@param `pixel` should be an Array.');

    if (this.isOpen()) {
      this.Internal.positionContainer(pixel);
    }
  };

  /**
   * Remove the last item of the menu.
   */
  Base.prototype.pop = function pop () {
    const keys = Object.keys(this.Internal.items);
    this.Html.removeMenuEntry(keys[keys.length - 1]);
  };

  /**
   * Insert the provided item at the end of the menu.
   * @param {Object|String} item Item.
   */
  Base.prototype.push = function push (item) {
    assert(isDefAndNotNull(item), '@param `item` must be informed.');
    this.Html.addMenuEntry(item);
  };

  /**
   * Remove the first item of the menu.
   */
  Base.prototype.shift = function shift () {
    this.Html.removeMenuEntry(Object.keys(this.Internal.items)[0]);
  };

  /**
   * Not supposed to be used on app.
   */
  Base.prototype.setMap = function setMap (map) {

    ol.control.Control.prototype.setMap.call(this, map);

    if (map) {
      // let's start since now we have the map
      this.Internal.init(map, this);
    } else {
      // I'm removed from the map - remove listeners
      this.Internal.removeListeners();
    }
  };

  return Base;
}(ol.control.Control));

return Base;

})));
