
/**
 * @constructor
 */
CM.Html = function(menu){
  this.options = menu.options;
  this.container = this.createContainer();
};

CM.Html.prototype = {
  createContainer: function() {
    var container = document.createElement('ul');
    container.className = 'ol-contextmenu ol-unselectable hidden';
    container.style.width = parseInt(this.options.width, 10) + 'px';
    return container;
  },
  createMenu: function() {
    var options = this.options, items = [];

    if('items' in options){
      items = (options.default_items) ?
        options.items.concat(CM.defaultItems) : options.items;
    } else if(options.default_items){
      items = CM.defaultItems;
    }
    
    //no item
    if(items.length === 0) return false;

    // create entries
    items.forEach(this.addMenuEntry, this);
  },
  addMenuEntry: function(item, index) {
    var classname, style = '', html = '';
    
    //separator
    if(typeof item === 'string'){
      if(item.trim() == '-'){
        html = '<li class="ol-menu-sep"><hr></li>';
      }
    } else {
      if(item.icon){
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

    CM.items[index] = {
      id: index,
      callback: item.callback,
      data: item.data || null
    };
    
    // publish to add listener
    events.publish(CM.Constants.eventType.ADD_MENU_ENTRY, {
      index: index,
      element: child
    });
  }
};
