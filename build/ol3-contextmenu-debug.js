/**
 * Custom Context Menu for Openlayers 3
 * https://github.com/jonataswalker/ol3-contextmenu
 * Version: v2.2.2
 * Built: 2016-07-29T09:38:39-03:00
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ContextMenu = factory());
}(this, function () { 'use strict';

	var namespace = "ol-ctx-menu";
	var container_class = "-container";
	var separator_class = "-separator";
	var submenu_class = "-submenu";
	var hidden_class = "-hidden";
	var icon_class = "-icon";
	var zoom_in_class = "-zoom-in";
	var zoom_out_class = "-zoom-out";
	var ol_unselectable_class = "ol-unselectable";

	/**
	 * @module utils
	 * All the helper functions needed in this project
	 */
	var utils = {
	  isNumeric: function isNumeric(str) {
	    return /^\d+$/.test(str);
	  },
	  classRegex: function classRegex(classname) {
	    return new RegExp(("(^|\\s+) " + classname + " (\\s+|$)"));
	  },
	  /**
	   * @param {Element|Array<Element>} element DOM node or array of nodes.
	   * @param {String|Array<String>} classname Class or array of classes.
	   * For example: 'class1 class2' or ['class1', 'class2']
	   * @param {Number|undefined} timeout Timeout to remove a class.
	   */
	  addClass: function addClass(element, classname, timeout) {
	    var this$1 = this;

	    if (Array.isArray(element)) {
	      element.forEach(function (each) { this$1.addClass(each, classname); });
	      return;
	    }
	    
	    var array = (Array.isArray(classname)) ? classname : classname.split(/\s+/);
	    var i = array.length;
	    
	    while(i--) {
	      if (!this$1.hasClass(element, array[i])) {
	        this$1._addClass(element, array[i], timeout);
	      }
	    }
	  },
	  _addClass: function _addClass(el, c, timeout) {
	    var this$1 = this;

	    // use native if available
	    if (el.classList) {
	      el.classList.add(c);
	    } else {
	      el.className = (el.className +' '+ c).trim();
	    }
	    
	    if (timeout && this.isNumeric(timeout)) {
	      window.setTimeout(function () { this$1._removeClass(el, c); }, timeout);
	    }
	  },
	  /**
	   * @param {Element|Array<Element>} element DOM node or array of nodes.
	   * @param {String|Array<String>} classname Class or array of classes.
	   * For example: 'class1 class2' or ['class1', 'class2']
	   * @param {Number|undefined} timeout Timeout to add a class.
	   */
	  removeClass: function removeClass(element, classname, timeout) {
	    var this$1 = this;

	    if (Array.isArray(element)) {
	      element.forEach(function (each) { this$1.removeClass(each, classname, timeout); });
	      return;
	    }
	    
	    var array = (Array.isArray(classname)) ? classname : classname.split(/\s+/);
	    var i = array.length;
	    
	    while(i--) {
	      if (this$1.hasClass(element, array[i])) {
	        this$1._removeClass(element, array[i], timeout);
	      }
	    }
	  },
	  _removeClass: function _removeClass(el, c, timeout) {
	    var this$1 = this;

	    if (el.classList) {
	      el.classList.remove(c);
	    } else {
	      el.className = (el.className.replace(this.classRegex(c), ' ')).trim();
	    }
	    if (timeout && this.isNumeric(timeout)) {
	      window.setTimeout(function () {
	        this$1._addClass(el, c);
	      }, timeout);
	    }
	  },
	  /**
	   * @param {Element} element DOM node.
	   * @param {String} classname Classname.
	   * @return {Boolean}
	   */
	  hasClass: function hasClass(element, c) {
	    // use native if available
	    return (element.classList) ?
	      element.classList.contains(c) : this.classRegex(c).test(element.className);
	  },
	  /**
	   * @param {Element|Array<Element>} element DOM node or array of nodes.
	   * @param {String} classname Classe.
	   */
	  toggleClass: function toggleClass(element, classname) {
	    var this$1 = this;

	    if (Array.isArray(element)) {
	      element.forEach(function (each) { this$1.toggleClass(each, classname); });
	      return;
	    }
	    
	    // use native if available
	    if (element.classList) {
	      element.classList.toggle(classname);
	    } else {
	      if (this.hasClass(element, classname)) {
	        this._removeClass(element, classname);
	      } else {
	        this._addClass(element, classname);
	      }
	    }
	  },
	  $: function $(id) {
	    id = (id[0] === '#') ? id.substr(1, id.length) : id;
	    return document.getElementById(id);
	  },
	  isElement: function isElement(obj) {
	    // DOM, Level2
	    if ('HTMLElement' in window) {
	      return (!!obj && obj instanceof HTMLElement);
	    }
	    // Older browsers
	    return (!!obj && typeof obj === 'object' && 
	      obj.nodeType === 1 && !!obj.nodeName);
	  },
	  /**
	   * Abstraction to querySelectorAll for increased 
	   * performance and greater usability
	   * @param {String} selector
	   * @param {Element} context (optional)
	   * @param {Boolean} find_all (optional)
	   * @return (find_all) {Element} : {Array}
	   */
	  find: function(selector, context, find_all){
	    if ( context === void 0 ) context = window.document;

	    var simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/, 
	        periodRe = /\./g, 
	        slice = Array.prototype.slice,
	        matches = [];

	    // Redirect call to the more performant function 
	    // if it's a simple selector and return an array
	    // for easier usage
	    if(simpleRe.test(selector)){
	      switch(selector[0]){
	        case '#':
	          matches = [this.$(selector.substr(1))];
	          break;
	        case '.':
	          matches = slice.call(context.getElementsByClassName(
	            selector.substr(1).replace(periodRe, ' ')));
	          break;
	        default:
	          matches = slice.call(context.getElementsByTagName(selector));
	      }
	    } else{
	      // If not a simple selector, query the DOM as usual 
	      // and return an array for easier usage
	      matches = slice.call(context.querySelectorAll(selector));
	    }
	    
	    return (find_all) ? matches : matches[0];
	  },
	  getAllChildren: function getAllChildren(node, tag) {
	    return [].slice.call(node.getElementsByTagName(tag));
	  },
	  isEmpty: function isEmpty(str) {
	    return (!str || 0 === str.length);
	  },
	  emptyArray: function emptyArray(array) {
	    while(array.length) array.pop();
	  },
	  removeAllChildren: function removeAllChildren(node) {
	    while (node.firstChild) {
	      node.removeChild(node.firstChild);
	    }
	  },
	  /**
	   * Overwrites obj1's values with obj2's and adds 
	   * obj2's if non existent in obj1
	   * @returns obj3 a new object based on obj1 and obj2
	   */
	  mergeOptions: function mergeOptions(obj1, obj2) {
	    var obj3 = {};
	    for (var attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
	    for (var attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
	    return obj3;
	  },
	  createFragment: function createFragment(html) {
	    var frag = document.createDocumentFragment(),
	        temp = document.createElement('div');
	    temp.innerHTML = html;
	    while (temp.firstChild) {
	      frag.appendChild(temp.firstChild);
	    }
	    return frag;
	  },
	  /**
	   * Does str contain test?
	   * @param {String} str_test
	   * @param {String} str
	   * @returns Boolean
	   */
	  contains: function contains(str_test, str) {
	    return !!~str.indexOf(str_test);
	  },
	  isDefAndNotNull: function isDefAndNotNull(val) {
	    // Note that undefined == null.
	    return val != null;
	  },
	  assertEqual: function assertEqual(a, b, message) {
	    if (a != b) {
	      throw new Error(message + ' mismatch: ' + a + ' != ' + b);
	    }
	  },
	  assert: function assert(condition, message) {
	    if ( message === void 0 ) message = 'Assertion failed';

	    if (!condition) {
	      if (typeof Error !== 'undefined') {
	        throw new Error(message);
	      }
	      throw message; // Fallback
	    }
	  },
	  events: function events() {
	    var topics = {};
	    var hOP = topics.hasOwnProperty;
	    
	    return {
	      subscribe: function(topic, listener) {
	        // Create the topic's object if not yet created
	        if(!hOP.call(topics, topic)) topics[topic] = [];
	        
	        // Add the listener to queue
	        var index = topics[topic].push(listener) -1;
	        
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
	        if(!hOP.call(topics, topic)) return;
	        
	        // Cycle through topics queue, fire!
	        topics[topic].forEach(function (item) {
	          item(info !== undefined ? info : {});
	        });
	      }
	    };
	  }
	};

	var eventType = {
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
	  ADD_MENU_ENTRY: 'add-menu-entry'
	};

	var defaultOptions = {
	  width: 150,
	  default_items: true
	};

	// internal pub/sub
	var events = utils.events();

	var defaultItems = [
	  {
	    text: 'Zoom In',
	    classname: [
	      namespace + zoom_in_class, 
	      namespace + icon_class
	    ].join(' '),
	    callback: function(obj, map){
	      var
	        view = map.getView(),
	        pan = ol.animation.pan({
	          duration: 1000,
	          source: view.getCenter()
	        }),
	        zoom = ol.animation.zoom({
	          duration: 1000,
	          resolution: view.getResolution()
	        })
	      ;

	      map.beforeRender(pan, zoom);
	      view.setCenter(obj.coordinate);
	      view.setZoom(+view.getZoom() + 1);
	    }
	  },
	  {
	    text: 'Zoom Out',
	    classname: [
	      namespace + zoom_out_class,
	      namespace + icon_class
	    ].join(' '),
	    callback: function(obj, map){
	      var
	        view = map.getView(),
	        pan = ol.animation.pan({
	          duration: 1000,
	          source: view.getCenter()
	        }),
	        zoom = ol.animation.zoom({
	          duration: 1000,
	          resolution: view.getResolution()
	        })
	      ;
	      map.beforeRender(pan, zoom);
	      view.setCenter(obj.coordinate);
	      view.setZoom(+view.getZoom() - 1);
	    }
	  }
	];

	/**
	 * @class Internal
	 */
	var Internal = function Internal(base) {
	  this.Base = base;

	  this.map = undefined;
	  this.coordinate_clicked = undefined;
	  this.pixel_clicked = undefined;
	  this.counter = 0;
	  this.lineHeight = 0;
	  this.items = {};
	  this.submenu = {
	    left: this.Base.options.width - 15 + 'px',
	    last_left: '' // string + px
	  };
	    
	  return this;
	};
	  
	Internal.prototype.init = function init (map) {
	  this.map = map;
	  // subscribe
	  this.setListeners();
	  // publish
	  this.Base.constructor.Html.createMenu();
	  this.lineHeight = this.getItemsLength() > 0 ?
	    this.Base.container.offsetHeight / this.getItemsLength() :
	    this.Base.constructor.Html.cloneAndGetLineHeight();
	};

	Internal.prototype.getItemsLength = function getItemsLength () {
	    var this$1 = this;

	  var count = 0;
	  Object.keys(this.items).forEach(function (k) {
	    if (this$1.items[k].submenu || this$1.items[k].separator) return;
	    count++;
	  });
	  return count;
	};

	Internal.prototype.getPixelClicked = function getPixelClicked () {
	  return this.pixel_clicked;
	};

	Internal.prototype.getCoordinateClicked = function getCoordinateClicked () {
	  return this.coordinate_clicked;
	};

	Internal.prototype.positionContainer = function positionContainer (pixel) {
	    var this$1 = this;

	  var map_size = this.map.getSize(),
	      map_w = map_size[0],
	      map_h = map_size[1],
	      // how much (width) space left over
	      space_left_h = map_h - pixel[1],
	      // how much (height) space left over
	      space_left_w = map_w - pixel[0],
	      menu_size = {
	        w: this.Base.container.offsetWidth,
	        // a cheap way to recalculate container height
	        // since offsetHeight is like cached
	        h: Math.round(this.lineHeight * this.getItemsLength())
	      },
	      // submenus <ul>
	      uls = utils.find('li.' + namespace + submenu_class + '>ul', 
	          this.Base.container, true);
	    
	  if (space_left_w >= menu_size.w) {
	    this.Base.container.style.right = 'auto';
	    this.Base.container.style.left = (pixel[0] + 5) + "px";
	  } else {
	    this.Base.container.style.left = 'auto';
	    this.Base.container.style.right = '15px';
	  }
	  // set top or bottom
	  if (space_left_h >= menu_size.h) {
	    this.Base.container.style.bottom = 'auto';
	    this.Base.container.style.top = (pixel[1] - 10) + "px";
	  } else {
	    this.Base.container.style.top = 'auto';
	    this.Base.container.style.bottom = 0;
	  }
	    
	  utils.removeClass(this.Base.container, namespace + hidden_class);
	    
	  if (uls.length) {
	    if (space_left_w < (menu_size.w * 2)) {
	      // no space (at right) for submenu
	      // position them at left
	      this.submenu.last_left = "-" + (menu_size.w) + "px";
	    } else {
	      this.submenu.last_left = this.submenu.left;
	    }
	    uls.forEach(function (ul) {
	      ul.style.left = this$1.submenu.last_left;
	    });
	  }
	};

	Internal.prototype.openMenu = function openMenu (pixel, coordinate) {
	  this.positionContainer(pixel);
	    
	  this.Base.dispatchEvent({
	    type: eventType.OPEN,
	    pixel: pixel,
	    coordinate: coordinate
	  });
	};

	Internal.prototype.closeMenu = function closeMenu () {
	  utils.addClass(this.Base.container, namespace + hidden_class);
	  this.Base.dispatchEvent({
	    type: eventType.CLOSE
	  });
	};

	Internal.prototype.getNextItemIndex = function getNextItemIndex () {
	  return ++this.counter;
	};

	Internal.prototype.setListeners = function setListeners () {
	  var this_ = this,
	      map = this.map,
	      canvas = map.getTargetElement(),
	      menu = function(evt) {
	        this_.coordinate_clicked = map.getEventCoordinate(evt);
	        this_.pixel_clicked = map.getEventPixel(evt);

	        this_.Base.dispatchEvent({
	          type: eventType.BEFOREOPEN,
	          pixel: this_.pixel_clicked,
	          coordinate: this_.coordinate_clicked
	        });
	          
	        if (this_.Base.disabled) {
	          return;
	        }

	        evt.stopPropagation();
	        evt.preventDefault();
	        this_.openMenu(this_.pixel_clicked, this_.coordinate_clicked);
	          
	        //one-time fire
	        canvas.addEventListener('mousedown', {
	          handleEvent: function (evt) {
	            this_.closeMenu();
	            canvas.removeEventListener(evt.type, this, false);
	          }
	        }, false);
	      };
	  canvas.addEventListener('contextmenu', menu, false);
	    
	  // subscribe to later menu entries
	  events.subscribe(eventType.ADD_MENU_ENTRY, function (obj) {
	    this_.setItemListener(obj.element, obj.index);
	  });
	};

	Internal.prototype.setItemListener = function setItemListener (li, index) {
	  var this_ = this;
	  if(li && typeof this.items[index].callback === 'function') {
	    (function(callback){
	      li.addEventListener('click', function(evt){
	        evt.preventDefault();
	        var obj = {
	          coordinate: this_.getCoordinateClicked(),
	          data: this_.items[index].data || null
	        };
	        this_.closeMenu();
	        callback.call(undefined, obj, this_.map);
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
	  
	Html.prototype.createContainer = function createContainer () {
	  var container = document.createElement('ul');
	  container.className = [
	    namespace + container_class,
	    namespace + hidden_class,
	    ol_unselectable_class
	  ].join(' ');
	  container.style.width = parseInt(this.Base.options.width, 10) + 'px';
	  return container;
	};
	  
	Html.prototype.createMenu = function createMenu () {
	  var options = this.Base.options, items = [];
	    
	  if ('items' in options) {
	    items = (options.default_items) ?
	      options.items.concat(defaultItems) : options.items;
	  } else if (options.default_items) {
	    items = defaultItems;
	  }
	    
	  // no item
	  if(items.length === 0) return false;
	    
	  // create entries
	  items.forEach(this.addMenuEntry, this);
	};
	  
	Html.prototype.addMenuEntry = function addMenuEntry (item) {
	    var this$1 = this;

	  var $internal = this.Base.constructor.Internal;
	  var index = $internal.getNextItemIndex();
	  var submenu_class$$ = namespace + submenu_class;
	    
	  if (item.items && Array.isArray(item.items)) {
	    // submenu - only a second level
	    item.classname = item.classname || '';
	    if (!utils.contains(submenu_class$$, item.classname)) {
	      item.classname = 
	        item.classname.length > 0 ? ' ' + submenu_class$$ : submenu_class$$;
	    }
	      
	    var li = this.generateHtmlAndPublish(this.container, item, index);
	    var ul = document.createElement('ul');
	      
	    ul.className = namespace + container_class;
	    ul.style.left = $internal.submenu.last_left || $internal.submenu.left;
	    ul.style.width = this.Base.options.width + 'px';
	    li.appendChild(ul);
	      
	    item.items.forEach(function (each) {
	      this$1.generateHtmlAndPublish(ul, each, $internal.getNextItemIndex(), true);
	    });
	  } else {
	    this.generateHtmlAndPublish(this.container, item, index);
	  }
	};
	  
	Html.prototype.generateHtmlAndPublish = function generateHtmlAndPublish (parent, item, index, submenu) {
	  var html, frag, element, separator = false;
	  var $internal = this.Base.constructor.Internal;
	    
	  // separator
	  if (typeof item === 'string' && item.trim() == '-') {
	    html = [
	      '<li id="index',
	      index,
	      '" class="',
	      namespace,
	      separator_class,
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
	        item.classname = namespace + icon_class;
	      } else if (item.classname.indexOf(namespace + icon_class) === -1) {
	        item.classname += ' ' + namespace + icon_class;
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
	  events.publish(eventType.ADD_MENU_ENTRY, {
	    index: index,
	    element: element
	  });
	    
	  return element;
	};
	  
	Html.prototype.removeMenuEntry = function removeMenuEntry (index) {
	  var element = utils.find('#index' + index, this.container);
	  if (element) {
	    this.container.removeChild(element);
	  }
	  delete this.Base.constructor.Internal.items[index];
	};
	  
	Html.prototype.cloneAndGetLineHeight = function cloneAndGetLineHeight () {
	  // for some reason I have to calculate with 2 items
	  var cloned = this.container.cloneNode();
	  var frag = utils.createFragment('<span>Foo</span>');
	  var frag2 = utils.createFragment('<span>Foo</span>');
	  var element = document.createElement('li');
	  var element2 = document.createElement('li');
	    
	  element.appendChild(frag);
	  element2.appendChild(frag2);
	  cloned.appendChild(element);
	  cloned.appendChild(element2);
	    
	  this.container.parentNode.appendChild(cloned);
	  var height = cloned.offsetHeight / 2;
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

	    utils.assert(typeof opt_options == 'object',
	      '@param `opt_options` should be object type!'
	    );
	    
	    this.options = utils.mergeOptions(defaultOptions, opt_options);
	    this.disabled = false;
	    
	    Base.Internal = new Internal(this);
	    Base.Html = new Html(this);

	    superclass.call(this, {
	      element: this.container
	    });
	  }

	  if ( superclass ) Base.__proto__ = superclass;
	  Base.prototype = Object.create( superclass && superclass.prototype );
	  Base.prototype.constructor = Base;

	  /**
	   * Remove all elements from the menu.
	   */
	  Base.prototype.clear = function clear () {
	    console.info(Base.Internal.items);
	    Object.keys(Base.Internal.items).forEach(function (k) {
	      Base.Html.removeMenuEntry(k);
	    });
	  };
	  
	  /**
	   * Close the menu programmatically.
	   */
	  Base.prototype.close = function close () {
	    Base.Internal.closeMenu();
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
	    return defaultItems;
	  };

	  /**
	   * Add items to the menu. This pushes each item in the provided array
	   * to the end of the menu.
	   * @param {Array} arr Array.
	   */
	  Base.prototype.extend = function extend (arr) {
	    utils.assert(Array.isArray(arr), '@param `arr` should be an Array.');
	    arr.forEach(this.push, this);
	  };
	  
	  /**
	   * Remove the last item of the menu.
	   */
	  Base.prototype.pop = function pop () {
	    var keys = Object.keys(Base.Internal.items);
	    Base.Html.removeMenuEntry(keys[keys.length - 1]);
	  };
	  
	  /**
	   * Insert the provided item at the end of the menu.
	   * @param {Object|String} item Item.
	   */
	  Base.prototype.push = function push (item) {
	    utils.assert(utils.isDefAndNotNull(item), '@param `item` must be informed.');
	    Base.Html.addMenuEntry(item, Base.Internal.getNextItemIndex());
	  };
	  
	  /**
	   * Remove the first item of the menu.
	   */
	  Base.prototype.shift = function shift () {
	    Base.Html.removeMenuEntry(Object.keys(Base.Internal.items)[0]);
	  };
	  
	  /**
	   * Not supposed to be used on app.
	   */
	  Base.prototype.setMap = function setMap (map) {
	    ol.control.Control.prototype.setMap.call(this, map);
	    //http://gis.stackexchange.com/a/136850/50718
	    // let's start since now we have the map
	    Base.Internal.init(map);
	  };

	  return Base;
	}(ol.control.Control));

	return Base;

}));