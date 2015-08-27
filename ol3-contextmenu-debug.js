(function(win, doc){
    'use strict';
    
    this.ContextMenu = (function(){
        
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
};(function(ContextMenu, win, doc){
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
                            log(view.getZoom());
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
})(ContextMenu, win, doc);(function(win, doc){
    'use strict';
    
   ContextMenu.Utils = {
        whiteSpaceRegex: /\s+/,
        to3857: function(coord){
            return ol.proj.transform(
                [parseFloat(coord[0]), parseFloat(coord[1])], 'EPSG:4326', 'EPSG:3857'
            );
        },
        to4326: function(coord){
            return ol.proj.transform(
                [parseFloat(coord[0]), parseFloat(coord[1])], 'EPSG:3857', 'EPSG:4326'
            );
        },
        classRegex: function(classname) {
            return new RegExp('(^|\\s+)' + classname + '(\\s+|$)');
        },
        _addClass: function(el, c){
            if (el.classList)
                el.classList.add(c);
            else
                el.className = (el.className + ' ' + c).trim();
        },
        addClass: function(el, classname){
            if(Array.isArray(el)){
                el.forEach(function(each){
                    utils.addClass(each, classname);
                });
                return;
            }
            
            //classname can be ['class1', 'class2'] or 'class1 class2'
            var 
                array = (Array.isArray(classname)) ?
                    classname : classname.split(utils.whiteSpaceRegex),
                i = array.length
            ;
            while(i--){
                if(!utils.hasClass(el, array[i])) utils._addClass(el, array[i]);
            }
        },
        _removeClass: function(el, c){
            if (el.classList)
                el.classList.remove(c);
            else 
                el.className = (el.className.replace(utils.classReg(c), ' ')).trim();
        },
        removeClass: function(el, classname){
            if(Array.isArray(el)){
                el.forEach(function(each){
                    utils.removeClass(each, classname);
                });
                return;
            }
            
            //classname can be ['class1', 'class2'] or 'class1 class2'
            var 
                array = (Array.isArray(classname)) ?
                classname : classname.split(utils.whiteSpaceRegex),
                i = array.length
            ;
            while(i--){
                if(utils.hasClass(el, array[i])) utils._removeClass(el, array[i]);
            }
        },
        hasClass: function(el, c){
            return (el.classList) ? 
                el.classList.contains(c) : utils.classReg(c).test(el.className);
        },
        toggleClass: function(el, c){
            if(Array.isArray(el)){
                el.forEach(function(each){
                    utils.toggleClass(each, c);
                });
                return;
            }
            
            if(el.classList)
                el.classList.toggle(c);
            else
                utils.hasClass(el, c) ? utils._removeClass(el, c) : utils._addClass(el, c);
        },
        $: function(id){
            id = (id[0] === '#') ? id.substr(1, id.length) : id;
            return doc.getElementById(id);
        },
        isElement: function(obj){
            // DOM, Level2
            if ("HTMLElement" in win) {
                return (!!obj && obj instanceof HTMLElement);
            }
            // Older browsers
            return (!!obj && typeof obj === "object" && 
            obj.nodeType === 1 && !!obj.nodeName);
        },
        getAllChildren: function(node, tag){
            return [].slice.call(node.getElementsByTagName(tag));
        },
        emptyArray: function(array){
            while(array.length) array.pop();
        },
        removeAllChildren: function(node) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
        },
        removeAll: function(collection) {
            var node;
            while (node = collection[0])
                node.parentNode.removeChild(node);
        },
        getChildren: function(node, tag){
            return [].filter.call(node.childNodes, function(el) {
                return (tag) ? 
                    el.nodeType == 1 && el.tagName.toLowerCase() == tag
                    :
                    el.nodeType == 1;
            });
        },
        template: function(html, row){
            var this_ = this;
            
            return html.replace(/\{ *([\w_-]+) *\}/g, function (html, key) {
                var value = (row[key]  === undefined) ? '' : row[key];
                return this_.htmlEscape(value);
            });
        },
        htmlEscape: function(str){
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
        mergeOptions: function(obj1, obj2){
            var obj3 = {};
            for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
            for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
            return obj3;
        },
        createElement: function(node, html){
            var elem;
            if(Array.isArray(node)){
                elem = doc.createElement(node[0]);
                
                if(node[1].id) elem.id = node[1].id;
                if(node[1].classname) elem.className = node[1].classname;
                
                if(node[1].attr){
                    var attr = node[1].attr;
                    if(Array.isArray(attr)){
                        var i = -1;
                        while(++i < attr.length){
                            elem.setAttribute(attr[i].name, attr[i].value);
                        }
                    } else {
                        elem.setAttribute(attr.name, attr.value);
                    }
                }
            } else{
                elem = doc.createElement(node);
            }
            elem.innerHTML = html;
            var frag = doc.createDocumentFragment();
            
            while (elem.childNodes[0]) {
                frag.appendChild(elem.childNodes[0]);
            }
            elem.appendChild(frag);
            return elem;
        }
    };
})(win, doc);
        
        return ContextMenu;
    })();
    var
        log = function(m){console.info(m)},
        utils = ContextMenu.Utils
    ;
}).call(this, window, document);
