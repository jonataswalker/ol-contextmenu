// Custom Context Menu for Openlayers 3.
// https://github.com/jonataswalker/ol3-contextmenu
// Version: v1.2.0
// Built: 2016-03-31T22:38:31-0300

'use strict';

(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.ContextMenu = factory();
  }
}(this, function() {

  var CM = {};
  /**
   * Helper
   */
  var utils = {
    whiteSpaceRegex: /\s+/,
    to3857: function(coord) {
      return ol.proj.transform(
        [parseFloat(coord[0]), parseFloat(coord[1])], 'EPSG:4326', 'EPSG:3857'
      );
    },
    to4326: function(coord) {
      return ol.proj.transform(
        [parseFloat(coord[0]), parseFloat(coord[1])], 'EPSG:3857', 'EPSG:4326'
      );
    },
    isNumeric: function(str) {
      return /^\d+$/.test(str);
    },
    classRegex: function(classname) {
      return new RegExp('(^|\\s+)' + classname + '(\\s+|$)');
    },
    /**
     * @param {Element|Array<Element>} element DOM node or array of nodes.
     * @param {String|Array<String>} classname Class or array of classes.
     * For example: 'class1 class2' or ['class1', 'class2']
     * @param {Number|undefined} timeout Timeout to remove a class.
     */
    addClass: function(element, classname, timeout) {
      if (Array.isArray(element)) {
        element.forEach(function(each) {
          utils.addClass(each, classname);
        });
        return;
      }

      var
        array = (Array.isArray(classname)) ? classname : classname.split(/\s+/),
        i = array.length;
      while (i--) {
        if (!utils.hasClass(element, array[i])) {
          utils._addClass(element, array[i], timeout);
        }
      }
    },
    _addClass: function(el, c, timeout) {
      // use native if available
      if (el.classList) {
        el.classList.add(c);
      } else {
        el.className = (el.className + ' ' + c).trim();
      }

      if (timeout && utils.isNumeric(timeout)) {
        window.setTimeout(function() {
          utils._removeClass(el, c);
        }, timeout);
      }
    },
    /**
     * @param {Element|Array<Element>} element DOM node or array of nodes.
     * @param {String|Array<String>} classname Class or array of classes.
     * For example: 'class1 class2' or ['class1', 'class2']
     * @param {Number|undefined} timeout Timeout to add a class.
     */
    removeClass: function(element, classname, timeout) {
      if (Array.isArray(element)) {
        element.forEach(function(each) {
          utils.removeClass(each, classname, timeout);
        });
        return;
      }

      var
        array = (Array.isArray(classname)) ? classname : classname.split(/\s+/),
        i = array.length;
      while (i--) {
        if (utils.hasClass(element, array[i])) {
          utils._removeClass(element, array[i], timeout);
        }
      }
    },
    _removeClass: function(el, c, timeout) {
      if (el.classList) {
        el.classList.remove(c);
      } else {
        el.className = (el.className.replace(utils.classRegex(c), ' ')).trim();
      }
      if (timeout && utils.isNumeric(timeout)) {
        window.setTimeout(function() {
          utils._addClass(el, c);
        }, timeout);
      }
    },
    /**
     * @param {Element} element DOM node.
     * @param {String} classname Classname.
     * @return {Boolean}
     */
    hasClass: function(element, c) {
      // use native if available
      return (element.classList) ?
        element.classList.contains(c) : utils.classRegex(c).test(element.className);
    },
    /**
     * @param {Element|Array<Element>} element DOM node or array of nodes.
     * @param {String} classname Classe.
     */
    toggleClass: function(element, classname) {
      if (Array.isArray(element)) {
        element.forEach(function(each) {
          utils.toggleClass(each, classname);
        });
        return;
      }

      // use native if available
      if (element.classList) {
        element.classList.toggle(classname);
      } else {
        if (utils.hasClass(element, classname)) {
          utils._removeClass(element, classname);
        } else {
          utils._addClass(element, classname);
        }
      }
    },
    $: function(id) {
      id = (id[0] === '#') ? id.substr(1, id.length) : id;
      return document.getElementById(id);
    },
    isElement: function(obj) {
      // DOM, Level2
      if ('HTMLElement' in window) {
        return (!!obj && obj instanceof HTMLElement);
      }
      // Older browsers
      return (!!obj && typeof obj === 'object' &&
        obj.nodeType === 1 && !!obj.nodeName);
    },
    /*
     * Abstraction to querySelectorAll for increased 
     * performance and greater usability
     * @param {String} selector
     * @param {Element} context (optional)
     * @param {Boolean} find_all (optional)
     * @return (find_all) {Element} : {Array}
     */
    find: function(selector, context, find_all) {
      var simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/,
        periodRe = /\./g,
        slice = Array.prototype.slice,
        matches = [];

      context = context || window.document;

      // Redirect call to the more performant function 
      // if it's a simple selector and return an array
      // for easier usage
      if (simpleRe.test(selector)) {
        switch (selector[0]) {
          case '#':
            matches = [utils.$(selector.substr(1))];
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
    },
    getAllChildren: function(node, tag) {
      return [].slice.call(node.getElementsByTagName(tag));
    },
    emptyArray: function(array) {
      while (array.length) array.pop();
    },
    removeAllChildren: function(node) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    },
    removeAll: function(collection) {
      var node;
      while ((node = collection[0]))
        node.parentNode.removeChild(node);
    },
    getChildren: function(node, tag) {
      return [].filter.call(node.childNodes, function(el) {
        return (tag) ?
          el.nodeType == 1 && el.tagName.toLowerCase() == tag :
          el.nodeType == 1;
      });
    },
    template: function(html, row) {
      var this_ = this;

      return html.replace(/\{ *([\w_-]+) *\}/g, function(html, key) {
        var value = (row[key] === undefined) ? '' : row[key];
        return this_.htmlEscape(value);
      });
    },
    htmlEscape: function(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },
    /**
     * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
     * @returns obj3 a new object based on obj1 and obj2
     */
    mergeOptions: function(obj1, obj2) {
      var obj3 = {};
      for (var attr1 in obj1) {
        obj3[attr1] = obj1[attr1];
      }
      for (var attr2 in obj2) {
        obj3[attr2] = obj2[attr2];
      }
      return obj3;
    },
    escapeRegExp: function(str) {
      return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    },
    /**
     * Does str contain test?
     * @param {String} test
     * @param {String} str
     * @returns Boolean
     */
    test: function(test, str) {
      var regex = new RegExp(utils.escapeRegExp(test));
      return regex.test(str);
    },
    createElement: function(node, html) {
      var elem;
      if (Array.isArray(node)) {
        elem = document.createElement(node[0]);

        if (node[1].id) elem.id = node[1].id;
        if (node[1].classname) elem.className = node[1].classname;

        if (node[1].attr) {
          var attr = node[1].attr;
          if (Array.isArray(attr)) {
            var i = -1;
            while (++i < attr.length) {
              elem.setAttribute(attr[i].name, attr[i].value);
            }
          } else {
            elem.setAttribute(attr.name, attr.value);
          }
        }
      } else {
        elem = document.createElement(node);
      }
      elem.innerHTML = html;
      var frag = document.createDocumentFragment();

      while (elem.childNodes[0]) {
        frag.appendChild(elem.childNodes[0]);
      }
      elem.appendChild(frag);
      return elem;
    },
    createFragment: function(html) {
      var
        frag = document.createDocumentFragment(),
        temp = document.createElement('div');
      temp.innerHTML = html;
      while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
      }
      return frag;
    },
    clone: function(obj) {
      var copy;

      // Handle the 3 simple types, and null or undefined
      if (null === obj || 'object' != typeof obj) return obj;

      // Handle Date
      if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
      }

      // Handle Array
      if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
          copy[i] = utils.clone(obj[i]);
        }
        return copy;
      }

      // Handle Object
      if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) {
            copy[attr] = utils.clone(obj[attr]);
          }
        }
        return copy;
      }

      throw new Error('Unable to copy obj! Its type is not supported.');
    },
    isDefAndNotNull: function(val) {
      // Note that undefined == null.
      /* jshint eqnull:true */
      return val != null;
    },
    assert: function(condition, message) {
      if (!condition) {
        message = message || 'Assertion failed';
        if (typeof Error !== 'undefined') {
          throw new Error(message);
        }
        throw message; // Fallback
      }
    },
    assertEqual: function(a, b, message) {
      if (a != b) {
        throw new Error(message + ' mismatch: ' + a + ' != ' + b);
      }
    }
  };

  /**
   * Pub/Sub
   */
  var events = (function() {
    var topics = {};
    var hOP = topics.hasOwnProperty;

    return {
      subscribe: function(topic, listener) {
        // Create the topic's object if not yet created
        if (!hOP.call(topics, topic)) topics[topic] = [];

        // Add the listener to queue
        var index = topics[topic].push(listener) - 1;

        // Provide handle back for removal of topic
        return {
          remove: function() {
            delete topics[topic][index];
          }
        };
      },
      publish: function(topic, info) {
        // If the topic doesn't exist, or there's no listeners
        // in queue, just leave
        if (!hOP.call(topics, topic)) return;

        // Cycle through topics queue, fire!
        topics[topic].forEach(function(item) {
          item(info !== undefined ? info : {});
        });
      }
    };
  })();

  /**
   * @constructor
   * @extends {ol.control.Control}
   * @param {Object|undefined} opt_options Options.
   */
  CM.Base = function(opt_options) {

    var defaults = {
      width: 150,
      default_items: true
    };
    CM.options = utils.mergeOptions(defaults, opt_options);
    CM.$base = this;
    CM.$html = new CM.Html();
    CM.$internal = new CM.Internal();

    ol.control.Control.call(this, {
      element: CM.container
    });
  };
  ol.inherits(CM.Base, ol.control.Control);

  /**
   * Remove all elements from the menu.
   */
  CM.Base.prototype.clear = function() {
    Object.keys(CM.items).forEach(function(key) {
      delete CM.items[key];
    });
    utils.removeAllChildren(CM.container);
  };

  /**
   * Add items to the menu. This pushes each item in the provided array
   * to the end of the menu.
   * @param {Array} arr Array.
   */
  CM.Base.prototype.extend = function(arr) {
    utils.assert(Array.isArray(arr), '@param `arr` should be an Array.');
    arr.forEach(this.push, this);
  };

  /**
   * Insert the provided item at the end of the menu.
   * @param {Object|String} item Item.
   */
  CM.Base.prototype.push = function(item) {
    utils.assert(utils.isDefAndNotNull(item), '@param `item` must be informed.');
    CM.$html.addMenuEntry(item, CM.$internal.getNextItemIndex());
    CM.$internal.positionContainer(CM.$internal.getPixelClicked());
  };

  /**
   * Remove the last item of the menu.
   */
  CM.Base.prototype.pop = function() {
    var last = CM.container.lastChild;
    if (last) {
      CM.container.removeChild(last);
    }
  };

  /**
   * @return {Array} Returns default items
   */
  CM.Base.prototype.getDefaultItems = function() {
    return CM.defaultItems;
  };

  /**
   * Not supposed to be used on app.
   */
  CM.Base.prototype.setMap = function(map) {
    ol.control.Control.prototype.setMap.call(this, map);
    //http://gis.stackexchange.com/a/136850/50718
    // let's start since now we have the map
    CM.$internal.init(map);
  };

  /**
   * @constructor
   */
  CM.Internal = function() {
    this.map = undefined;
    this.coordinate_clicked = undefined;
    this.pixel_clicked = undefined;
    this.counter = 0;
    this.lineHeight = 0;
    CM.submenu = {
      left: CM.options.width - 15 + 'px',
      last_left: '' // string + px
    };
  };

  CM.Internal.prototype = {
    init: function(map) {
      this.map = map;
      // subscribe
      this.setListeners();
      // publish
      CM.$html.createMenu();
      this.lineHeight = CM.container.offsetHeight / this.getItemsLength();
    },
    getItemsLength: function() {
      var count = 0;
      Object.keys(CM.items).forEach(function(k) {
        if (CM.items[k].submenu || CM.items[k].separator) return;
        count++;
      });
      return count;
    },
    getPixelClicked: function() {
      return this.pixel_clicked;
    },
    getCoordinateClicked: function() {
      return this.coordinate_clicked;
    },
    positionContainer: function(pixel) {
      var classes = CM.Constants.css,
        map_size = this.map.getSize(),
        map_w = map_size[0],
        map_h = map_size[1],
        // how much (width) space left over
        space_left_h = map_h - pixel[1],
        // how much (height) space left over
        space_left_w = map_w - pixel[0],
        menu_size = {
          w: CM.container.offsetWidth,
          // a cheap way to recalculate container height
          // since offsetHeight is like cached
          h: Math.round(this.lineHeight * this.getItemsLength())
        },
        // submenus <ul>
        uls = utils.find('li.' + classes.submenu + '>ul', CM.container, true);

      if (space_left_w >= menu_size.w) {
        CM.container.style.right = 'auto';
        CM.container.style.left = pixel[0] + 5 + 'px';
      } else {
        CM.container.style.left = 'auto';
        CM.container.style.right = 15 + 'px';
      }
      // set top or bottom
      if (space_left_h >= menu_size.h) {
        CM.container.style.bottom = 'auto';
        CM.container.style.top = pixel[1] - 10 + 'px';
      } else {
        CM.container.style.top = 'auto';
        CM.container.style.bottom = 0 + 'px';
      }

      utils.removeClass(CM.container, classes.hidden);

      if (uls.length) {
        if (space_left_w < (menu_size.w * 2)) {
          // no space (at right) for submenu
          // position them at left
          CM.submenu.last_left = '-' + menu_size.w + 'px';
        } else {
          CM.submenu.last_left = CM.submenu.left;
        }
        uls.forEach(function(ul) {
          ul.style.left = CM.submenu.last_left;
        });
      }
    },
    openMenu: function(pixel, coordinate) {
      this.positionContainer(pixel);

      CM.$base.dispatchEvent({
        type: CM.EventType.OPEN,
        pixel: pixel,
        coordinate: coordinate,
      });
    },
    closeMenu: function() {
      utils.addClass(CM.container, CM.Constants.css.hidden);
      CM.$base.dispatchEvent({
        type: CM.EventType.CLOSE
      });
    },
    getNextItemIndex: function() {
      return ++this.counter;
    },
    setListeners: function() {
      var this_ = this,
        map = this.map,
        canvas = map.getTargetElement(),
        menu = function(evt) {
          evt.stopPropagation();
          evt.preventDefault();
          this_.coordinate_clicked = map.getEventCoordinate(evt);
          this_.pixel_clicked = map.getEventPixel(evt);
          this_.openMenu(this_.pixel_clicked, this_.coordinate_clicked);

          //one-time fire
          canvas.addEventListener('mousedown', {
            handleEvent: function(evt) {
              this_.closeMenu();
              canvas.removeEventListener(evt.type, this, false);
            }
          }, false);
        };
      canvas.addEventListener('contextmenu', menu, false);

      // subscribe to later menu entries
      events.subscribe(CM.EventType.ADD_MENU_ENTRY,
        function(obj) {
          this_.setItemListener(obj.element, obj.index);
        }
      );
    },
    setItemListener: function(li, index) {
      var this_ = this;
      if (li && typeof CM.items[index].callback === 'function') {
        (function(callback) {
          li.addEventListener('click', function(evt) {
            evt.preventDefault();
            var obj = {
              coordinate: this_.getCoordinateClicked(),
              data: CM.items[index].data || null
            };
            this_.closeMenu();
            callback.call(undefined, obj, this_.map);
          }, false);
        })(CM.items[index].callback);
      }
    }
  };

  CM.EventType = {
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
    ADD_MENU_ENTRY: 'add-menu-entry'
  };

  CM.items = {};

  CM.Constants = {
    css: {
      container: 'ol-contextmenu ol-unselectable',
      separator: 'ol-cm-separator',
      submenu: 'ol-cm-submenu',
      hidden: 'ol-cm-hidden',
      icon: 'ol-cm-icon'
    }
  };

  CM.defaultItems = [{
    text: 'Zoom In',
    classname: 'zoom-in ' + CM.Constants.css.icon,
    callback: function(obj, map) {
      var
        view = map.getView(),
        pan = ol.animation.pan({
          duration: 1000,
          source: view.getCenter()
        }),
        zoom = ol.animation.zoom({
          duration: 1000,
          resolution: view.getResolution()
        });

      map.beforeRender(pan, zoom);
      view.setCenter(obj.coordinate);
      view.setZoom(+view.getZoom() + 1);
    }
  }, {
    text: 'Zoom Out',
    classname: 'zoom-out ' + CM.Constants.css.icon,
    callback: function(obj, map) {
      var
        view = map.getView(),
        pan = ol.animation.pan({
          duration: 1000,
          source: view.getCenter()
        }),
        zoom = ol.animation.zoom({
          duration: 1000,
          resolution: view.getResolution()
        });
      map.beforeRender(pan, zoom);
      view.setCenter(obj.coordinate);
      view.setZoom(+view.getZoom() - 1);
    }
  }];
  /**
   * @constructor
   */
  CM.Html = function() {
    CM.container = this.createContainer();
  };

  CM.Html.prototype = {
    createContainer: function() {
      var classes = CM.Constants.css;
      var container = document.createElement('ul');
      container.className = classes.container + ' ' + classes.hidden;
      container.style.width = parseInt(CM.options.width, 10) + 'px';
      return container;
    },
    createMenu: function() {
      var options = CM.options,
        items = [];

      if ('items' in options) {
        items = (options.default_items) ?
          options.items.concat(CM.defaultItems) : options.items;
      } else if (options.default_items) {
        items = CM.defaultItems;
      }

      //no item
      if (items.length === 0) return false;

      // create entries
      items.forEach(this.addMenuEntry, this);
    },
    addMenuEntry: function(item) {
      var classes = CM.Constants.css;
      var this_ = this;
      var index = CM.$internal.getNextItemIndex();

      if (item.items && Array.isArray(item.items)) {
        // submenu - only a second level
        item.classname = item.classname || '';
        if (!utils.test(classes.submenu, item.classname)) {
          item.classname += ' ' + classes.submenu;
        }

        var li = this.generateHtmlAndPublish(CM.container, item, index);
        var ul = document.createElement('ul');

        ul.className = classes.container;
        ul.style.left = CM.submenu.last_left || CM.submenu.left;
        ul.style.width = CM.options.width + 'px';
        li.appendChild(ul);

        item.items.forEach(function(each) {
          this_.generateHtmlAndPublish(ul, each, CM.$internal.getNextItemIndex(), true);
        });
      } else {
        this.generateHtmlAndPublish(CM.container, item, index);
      }
    },
    generateHtmlAndPublish: function(parent, item, i, submenu) {
      var html, frag, element, separator = false;
      var classes = CM.Constants.css;

      // separator
      if (typeof item === 'string' && item.trim() == '-') {
        html = '<li class="' + classes.separator + '"><hr></li>';
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
          item.classname += ' ' + classes.icon;
          element.setAttribute('style', 'background-image:url(' + item.icon + ')');
        }

        element.id = 'index' + i;
        element.className = item.classname;
        element.appendChild(frag);
        parent.appendChild(element);
      }

      CM.items[i] = {
        id: i,
        submenu: submenu || 0,
        separator: separator,
        callback: item.callback,
        data: item.data || null
      };

      // publish to add listener
      events.publish(CM.EventType.ADD_MENU_ENTRY, {
        index: i,
        element: element
      });

      return element;
    }
  };
  return CM.Base;
}));