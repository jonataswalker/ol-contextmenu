(function(win, doc){
  ContextMenu.Internal = function(menu){
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
        map_width     = map_size[0],
        map_height    = map_size[1],
        menu_width    = menu_size[0],
        menu_height   = menu_size[1],
        height_left   = map_height - pixel[1],
        width_left    = map_width - pixel[0],
        top = (height_left >= menu_height) ?
          pixel[1] - 10 : pixel[1] - menu_height - 10,
        left = (width_left >= menu_width) ?
          pixel[0] + 5 : pixel[0] - menu_width - 5
      ;

      utils.removeClass(this.container, 'hidden');
      this.container.style.left = left + 'px';
      this.container.style.top = top + 'px';
      this.contextmenu.dispatchEvent({
        type: ContextMenu.EventType.OPEN,
        pixel: pixel,
        coordinate: coordinate,
      });
    },
    closeMenu: function(){
      utils.addClass(this.container, 'hidden');
      this.contextmenu.dispatchEvent({
        type: ContextMenu.EventType.CLOSE
      });
    },
    getNextItemIndex: function(){
      return Object.keys(ContextMenu.items).length;
    },
    setListeners: function() {
      var
        this_ = this,
        map = this.map,
        canvas = map.getTargetElement(),
        menu = function(evt){
          evt.stopPropagation();
          evt.preventDefault();
          this_.coordinate_clicked = map.getEventCoordinate(evt);
          this_.openMenu(map.getEventPixel(evt), this_.coordinate_clicked);
          
          //one-time fire
          canvas.addEventListener('mousedown', {
            handleEvent: function (evt) {
              this_.closeMenu();
              canvas.removeEventListener(evt.type, this, false);
            }
          }, false);
        }
      ;
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
      if(li && typeof ContextMenu.items[index].callback === 'function'){
        (function(callback){
          li.addEventListener('click', function(evt){
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

  ContextMenu.defaultItems = [
    {
      text: 'Zoom In',
      classname: 'zoom-in ol-contextmenu-icon',
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
      classname: 'zoom-out ol-contextmenu-icon',
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
  
})(win, doc);
