
/**
 * @constructor
 */
CM.Internal = function(){
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
    Object.keys(CM.items).forEach(function(k){
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
      uls.forEach(function(ul){
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
  closeMenu: function(){
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
        menu = function(evt){
          evt.stopPropagation();
          evt.preventDefault();
          this_.coordinate_clicked = map.getEventCoordinate(evt);
          this_.pixel_clicked = map.getEventPixel(evt);
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
    events.subscribe(CM.EventType.ADD_MENU_ENTRY,
      function(obj) {
        this_.setItemListener(obj.element, obj.index);
      }
    );
  },
  setItemListener: function(li, index) {
    var this_ = this;
    if(li && typeof CM.items[index].callback === 'function'){
      (function(callback){
        li.addEventListener('click', function(evt){
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

CM.defaultItems = [
  {
    text: 'Zoom In',
    classname: 'zoom-in ' + CM.Constants.css.icon,
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
    classname: 'zoom-out ' + CM.Constants.css.icon,
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
