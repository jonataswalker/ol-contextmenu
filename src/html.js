(function(ContextMenu, win, doc){
  ContextMenu.Html = function(menu){
    this.options = menu.options;
    this.container = this.createMenu();
  };
  ContextMenu.Html.prototype = {
    createMenu: function(){
      var
        this_ = this,
        options = this.options,
        items = []
      ;

      if('items' in options){
        items = (options.default_items) ?
          options.items.concat(ContextMenu.defaultItems) : options.items;
      } else if(options.default_items){
        items = ContextMenu.defaultItems;
      }
      
      //no item
      if(items.length === 0) return false;
 
      var
        i = -1,
        menu_html = '',
        len = items.length
      ;
      while(++i < len) {
        menu_html += this.getHtmlEntry(items[i], i);
      }
      var container = utils.createElement([
        'ul', { classname: 'ol-contextmenu ol-unselectable hidden' }
      ], menu_html);
      
      container.style.width = parseInt(options.width, 10) + 'px';
      return container;
    },
    getHtmlEntry: function(item, index) {
      var
        classname,
        style = '',
        menu_html = ''
      ;
      
      //separator
      if(typeof item === 'string'){
        if(item.trim() == '-'){
          menu_html = '<li class="ol-menu-sep"><hr></li>';
        }
      } else {
        if(item.icon){
          item.classname += ' ol-contextmenu-icon';
          style = ' style="background-image:url('+item.icon+')"';
        }
        
        classname = item.classname ? ' class="'+item.classname+'"' : '';
        menu_html = '<li id="index'+index+'"' + style + classname +'>' +
          item.text +'</li>';
        ContextMenu.items.push({
          id: index,
          callback: item.callback
        });
      }
      return menu_html;
    }
  };
})(ContextMenu, win, doc);
