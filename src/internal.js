(function(ContextMenu, win, doc){
  ContextMenu.Internal = function(menu){
    this.map = undefined;
    this.container = menu.container;
    this.coordinate_clicked = undefined;
  };
  ContextMenu.Internal.prototype = {
    init: function(map) {
      this.map = map;
      this.setListeners();
    },
    getCoordinateClicked: function() {
      return this.coordinate_clicked;
    },
    openMenu: function(pixel) {
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
    },
    closeMenu: function(){
      utils.addClass(this.container, 'hidden');
    },
    setListeners: function() {
      var
        this_ = this,
        map = this.map,
        canvas = map.getTargetElement(),
        items_len = ContextMenu.items.length,
        i = -1, li,
        menu = function(evt){
          evt.stopPropagation();
          evt.preventDefault();
          this_.openMenu(map.getEventPixel(evt));
          this_.coordinate_clicked = map.getEventCoordinate(evt);
          
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
      
      while(++i < items_len){
        li = this.container.querySelector('#index' + ContextMenu.items[i].id);
        this.setItemListener(li, i);
      }
    },
    setItemListener: function(li, index) {
      var this_ = this;
      
      if(li && typeof ContextMenu.items[index].callback === 'function'){
        (function(callback){
          li.addEventListener('click', function(evt){
            evt.preventDefault();
            var obj = {
              coordinate: this_.getCoordinateClicked()
            };
            this_.closeMenu();
            callback.call(undefined, obj, this_.map);
          }, false);
        })(ContextMenu.items[index].callback);
      }
    }
  };
  
  ContextMenu.items = [];

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
  
})(ContextMenu, win, doc);
