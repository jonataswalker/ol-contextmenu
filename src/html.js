(function(ContextMenu, win, doc){
    'use strict';
    
    ContextMenu.Html = function(menu){
        this.menu = menu;
        this.container = this.createMenu();
        return this;
    };
    ContextMenu.Html.prototype = {
        getMap: function(){
            return this.menu.getMap();
        },
        createMenu: function(){
            var
                this_ = this,
                default_items = [
                    {
                        text: 'Zoom In',
                        classname: 'zoom-in ol-contextmenu-icon',
                        callback: function(obj){
                            var
                                map = this_.getMap(),
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
                        callback: function(obj){
                            var
                                map = this_.getMap(),
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
                ],
                options = this.menu.options,
                items = [],
                menu_html = ''
            ;
            if('items' in options){
                items = (options.default_items)
                    ? options.items.concat(default_items)
                    : options.items;
            } else if(options.default_items){
                items = default_items;
            }
            
            //no item
            if(items.length == 0) return false;
 
            var
                i = -1,
                len = items.length,
                item, classname, style
            ;
            while(++i < len){
                item = items[i];
                style = '';
                
                //separator
                if(typeof item === 'string'){
                    if(item.trim() == '-'){
                        menu_html += '<li class="ol-menu-sep"><hr></li>';
                    }
                } else {
                    if(item['icon']){
                        item.classname += ' ol-contextmenu-icon';
                        style = ' style="background-image:url('+item.icon+')"';
                    }
                    
                    classname = item.classname
                        ? ' class="'+item.classname+'"'
                        : '';
                    menu_html += '<li '
                        + 'id="index'+i+'"'
                        + style
                        + classname +'>'
                        + item.text +'</li>';
                    ContextMenu.items.push({
                        id: i,
                        callback: item.callback
                    });
                }
            }
            var
                container = utils.createElement([
                    'ul', { classname: 'ol-contextmenu ol-unselectable hidden' }
                ], menu_html)
            ;
            container.style.width = parseInt(options.width, 10) + 'px';
            return container;
        }
    }
})(ContextMenu, win, doc);