// Custom Context Menu for Openlayers 3.
// https://github.com/jonataswalker/ol3-contextmenu
// Version: v1.1.0
// Built: 2016-02-15T16:01:34-0200

(function(win, doc) {
  'use strict';

  this.ContextMenu = (function() {


    /**
     * @constructor
     * @extends {ol.control.Control}
     * @param {Object|undefined} opt_options Options.
     */
    var ContextMenu = function(opt_options) {

      var defaults = {
        width: 150,
        default_items: true
      };
      this.options = utils.mergeOptions(defaults, opt_options);
      this.$html = new ContextMenu.Html(this);
      this.container = this.$html.container;
      this.$internal = new ContextMenu.Internal(this);

      ol.control.Control.call(this, {
        element: this.container
      });
    };
    ol.inherits(ContextMenu, ol.control.Control);

    /**
     * Remove all elements from the menu.
     */
    ContextMenu.prototype.clear = function() {
      utils.removeAllChildren(this.container);
    };

    /**
     * Add items to the menu. This pushes each item in the provided array
     * to the end of the menu.
     * @param {Array} arr Array.
     */
    ContextMenu.prototype.extend = function(arr) {
      utils.assert(Array.isArray(arr), '@param `arr` should be an Array.');
      arr.forEach(this.push, this);
    };

    /**
     * Insert the provided item at the end of the menu.
     * @param {Object|String} item Item.
     */
    ContextMenu.prototype.push = function(item) {
      utils.assert(utils.isDefAndNotNull(item), '@param `item` must be informed.');
      this.$html.addMenuEntry(item, this.$internal.getNextItemIndex());
    };

    /**
     * Remove the last item of the menu.
     */
    ContextMenu.prototype.pop = function() {
      var last = this.container.lastChild;
      if (last) {
        this.container.removeChild(last);
      }
    };

    /**
     * @return {Array} Returns default items
     */
    ContextMenu.prototype.getDefaultItems = function() {
      return ContextMenu.defaultItems;
    };

    /**
     * Not supposed to be used on app.
     */
    ContextMenu.prototype.setMap = function(map) {
      ol.control.Control.prototype.setMap.call(this, map);
      //http://gis.stackexchange.com/a/136850/50718
      // let's start since now we have the map
      this.$internal.init(map);
    };
    (function(win, doc) {
      ContextMenu.Internal = function(menu) {
        this.map = undefined;
        this.contextmenu = menu;
        this.container = menu.container;
        this.$html = menu.$html;
        this.coordinate_clicked = undefined;
      };
      ContextMenu.Internal.prototype = {
        init: function(map) {
          this.map = map;
          // subscribe
          this.setListeners();
          // publish
          this.$html.createMenu();
        },
        getCoordinateClicked: function() {
          return this.coordinate_clicked;
        },
        openMenu: function(pixel, coordinate) {
          var
            this_ = this,
            map_size = this.map.getSize(),
            menu_size = [
              this.container.offsetWidth,
              this.container.offsetHeight
            ],
            map_width = map_size[0],
            map_height = map_size[1],
            menu_width = menu_size[0],
            menu_height = menu_size[1],
            height_left = map_height - pixel[1],
            width_left = map_width - pixel[0],
            top = (height_left >= menu_height) ?
            pixel[1] - 10 : pixel[1] - menu_height - 10,
            left = (width_left >= menu_width) ?
            pixel[0] + 5 : pixel[0] - menu_width - 5;

          utils.removeClass(this.container, 'hidden');
          this.container.style.left = left + 'px';
          this.container.style.top = top + 'px';
          this.contextmenu.dispatchEvent({
            type: ContextMenu.EventType.OPEN,
            pixel: pixel,
            coordinate: coordinate,
          });
        },
        closeMenu: function() {
          utils.addClass(this.container, 'hidden');
          this.contextmenu.dispatchEvent({
            type: ContextMenu.EventType.CLOSE
          });
        },
        getNextItemIndex: function() {
          return Object.keys(ContextMenu.items).length;
        },
        setListeners: function() {
          var
            this_ = this,
            map = this.map,
            canvas = map.getTargetElement(),
            menu = function(evt) {
              evt.stopPropagation();
              evt.preventDefault();
              this_.coordinate_clicked = map.getEventCoordinate(evt);
              this_.openMenu(map.getEventPixel(evt), this_.coordinate_clicked);

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
          events.subscribe(ContextMenu.Constants.eventType.ADD_MENU_ENTRY,
            function(obj) {
              this_.setItemListener(obj.element, obj.index);
            }
          );
        },
        setItemListener: function(li, index) {
          var this_ = this;
          if (li && typeof ContextMenu.items[index].callback === 'function') {
            (function(callback) {
              li.addEventListener('click', function(evt) {
                evt.preventDefault();
                var obj = {
                  coordinate: this_.getCoordinateClicked(),
                  data: ContextMenu.items[index].data || null
                };
                this_.closeMenu();
                callback.call(undefined, obj, this_.map);
              }, false);
            })(ContextMenu.items[index].callback);
          }
        }
      };

      ContextMenu.EventType = {
        /**
         * Triggered when context menu is openned.
         */
        OPEN: 'open',
        /**
         * Triggered when context menu is closed.
         */
        CLOSE: 'close'
      };

      ContextMenu.items = {};

      ContextMenu.defaultItems = [{
        text: 'Zoom In',
        classname: 'zoom-in ol-contextmenu-icon',
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
        classname: 'zoom-out ol-contextmenu-icon',
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

    })(win, doc);
    (function(win, doc) {
      ContextMenu.Html = function(menu) {
        this.options = menu.options;
        this.container = this.createContainer();
      };
      ContextMenu.Html.prototype = {
        createContainer: function() {
          var container = doc.createElement('ul');
          container.className = 'ol-contextmenu ol-unselectable hidden';
          container.style.width = parseInt(this.options.width, 10) + 'px';
          return container;
        },
        createMenu: function() {
          var options = this.options,
            items = [];

          if ('items' in options) {
            items = (options.default_items) ?
              options.items.concat(ContextMenu.defaultItems) : options.items;
          } else if (options.default_items) {
            items = ContextMenu.defaultItems;
          }

          //no item
          if (items.length === 0) return false;

          // create entries
          items.forEach(this.addMenuEntry, this);
        },
        addMenuEntry: function(item, index) {
          var classname, style = '',
            html = '';

          //separator
          if (typeof item === 'string') {
            if (item.trim() == '-') {
              html = '<li class="ol-menu-sep"><hr></li>';
            }
          } else {
            if (item.icon) {
              item.classname += ' ol-contextmenu-icon';
              style = ' style="background-image:url(' + item.icon + ')"';
            }

            classname = item.classname ? ' class="' + item.classname + '"' : '';
            html = '<li id="index' + index + '"' + style + classname + '>' +
              item.text + '</li>';
          }

          var frag = utils.createFragment(html);
          // http://stackoverflow.com/a/13347298/4640499
          var child = [].slice.call(frag.childNodes, 0)[0];
          this.container.appendChild(frag);

          ContextMenu.items[index] = {
            id: index,
            callback: item.callback,
            data: item.data || null
          };

          // publish to add listener
          events.publish(ContextMenu.Constants.eventType.ADD_MENU_ENTRY, {
            index: index,
            element: child
          });
        }
      };
    })(win, doc);
    (function(win, doc) {
      ContextMenu.Constants = {
        eventType: {
          ADD_MENU_ENTRY: 'add-menu-entry'
        }
      };
    })(win, doc);
    (function(win, doc) {
      ContextMenu.Utils = {
        events: function() {
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
        },
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
            win.setTimeout(function() {
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
            win.setTimeout(function() {
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
          return doc.getElementById(id);
        },
        isElement: function(obj) {
          // DOM, Level2
          if ("HTMLElement" in win) {
            return (!!obj && obj instanceof HTMLElement);
          }
          // Older browsers
          return (!!obj && typeof obj === "object" &&
            obj.nodeType === 1 && !!obj.nodeName);
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
            .replace(/'/g, "&#039;");
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
        createElement: function(node, html) {
          var elem;
          if (Array.isArray(node)) {
            elem = doc.createElement(node[0]);

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
            elem = doc.createElement(node);
          }
          elem.innerHTML = html;
          var frag = doc.createDocumentFragment();

          while (elem.childNodes[0]) {
            frag.appendChild(elem.childNodes[0]);
          }
          elem.appendChild(frag);
          return elem;
        },
        createFragment: function(html) {
          var
            frag = doc.createDocumentFragment(),
            temp = doc.createElement('div');
          temp.innerHTML = html;
          while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
          }
          return frag;
        },
        isDefAndNotNull: function(val) {
          // Note that undefined == null.
          /* jshint eqnull:true */
          return val != null;
        },
        assert: function(condition, message) {
          if (!condition) {
            message = message || "Assertion failed";
            if (typeof Error !== "undefined") {
              throw new Error(message);
            }
            throw message; // Fallback
          }
        },
        assertEqual: function(a, b, message) {
          if (a != b) {
            throw new Error(message + " mismatch: " + a + " != " + b);
          }
        }
      };
    })(win, doc);
    return ContextMenu;
  })();
  var
    log = function(m) {
      console.info(m);
    },
    utils = ContextMenu.Utils,
    events = utils.events();
}).call(this, window, document);