var ContextMenu = function(opt_options){
    'use strict';
    
    var defaults = {
        width: 150,
        default_items: true
    };
    this.options = utils.mergeOptions(defaults, opt_options);
    
    var html = new ContextMenu.Html(this);
    if(!html) return;
    this.container = html.container;
    
    ol.control.Control.call(this, {
        element: html.container
    });
};
ol.inherits(ContextMenu, ol.control.Control);

ContextMenu.items = [];

ContextMenu.prototype.setMap = function(map) {
    ol.control.Control.prototype.setMap.call(this, map);
    //http://gis.stackexchange.com/a/136850/50718
    //can't call setListeners on constructor
    this.setListeners();
};
ContextMenu.prototype.setListeners = function(){
    var
        this_ = this,
        map = this.getMap(),
        canvas = map.getTargetElement(),
        coord_clicked,
        items_len = ContextMenu.items.length,
        i = -1, li,
        menu = function(evt){
            evt.stopPropagation();
            evt.preventDefault();
            this_.openMenu(map.getEventPixel(evt));
            coord_clicked = map.getEventCoordinate(evt);
           
            //one-time fire
            canvas.addEventListener('mousedown', {
                handleEvent: function (evt) {
                    this_.closeMenu();
                    canvas.removeEventListener(evt.type, this, false);
                }
            }, false);
        },
        getCoordinateClicked = function(){
            return coord_clicked;
        }
    ;
    canvas.addEventListener('contextmenu', menu, false);
    
    while(++i < items_len){
        li = this.container.querySelector('#index' + ContextMenu.items[i].id);
        
        if(li && typeof ContextMenu.items[i].callback === 'function'){
            (function(callback){
                li.addEventListener('click', function(evt){
                    evt.preventDefault();
                    var
                        coord = getCoordinateClicked(),
                        obj = {
                            coordinate: coord
                        }
                    ;
                    this_.closeMenu();
                    callback(obj);
                }, false);
            })(ContextMenu.items[i].callback);
        }
    }
};
ContextMenu.prototype.openMenu = function(pixel){
    var
        this_ = this,
        map = this.getMap(),
        map_size = map.getSize(),
        menu_size = [
            this.container.offsetWidth,
            this.container.offsetHeight
        ],
        map_width       = map_size[0],
        map_height      = map_size[1],
        menu_width      = menu_size[0],
        menu_height     = menu_size[1],
        height_left     = map_height - pixel[1],
        width_left      = map_width - pixel[0],
        top             = 0,
        left            = 0
    ;
    top = (height_left >= menu_height)
        ? pixel[1] - 10
        : pixel[1] - menu_height - 10;
        
    left = (width_left >= menu_width)
        ? pixel[0] + 5
        : pixel[0] - menu_width - 5;
    
    utils.removeClass(this.container, 'hidden');
    this.container.style.left = left + 'px';
    this.container.style.top = top + 'px';
    
};
ContextMenu.prototype.closeMenu = function(){
    utils.addClass(this.container, 'hidden');
};