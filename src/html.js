/**
 * @constructor
 */
CM.Html = function(){
  CM.container = this.createContainer();
};

CM.Html.prototype = {
  createContainer: function() {
    var classes = CM.Constants.css;
    var container = document.createElement('ul');
    container.className = classes.container +' '+ classes.hidden;
    container.style.width = parseInt(CM.options.width, 10) + 'px';
    return container;
  },
  createMenu: function() {
    var options = CM.options, items = [];

    if ('items' in options) {
      items = (options.default_items) ?
        options.items.concat(CM.defaultItems) : options.items;
    } else if (options.default_items) {
      items = CM.defaultItems;
    }
    
    //no item
    if(items.length === 0) return false;

    // create entries
    items.forEach(this.addMenuEntry, this);
  },
  addMenuEntry: function(item) {
    var classes = CM.Constants.css;
    var this_ = this;
    var index = CM.$internal.getNextItemIndex();
    
    if (item.items && Array.isArray(item.items)) {
      // submenu - only a second level
      item.classname = item.classname || '';
      if (!utils.test(classes.submenu, item.classname)) {
        item.classname += ' ' + classes.submenu;
      }
      
      var li = this.generateHtmlAndPublish(CM.container, item, index);
      var ul = document.createElement('ul');
      
      ul.className = classes.container;
      ul.style.left = CM.submenu.last_left || CM.submenu.left;
      ul.style.width = CM.options.width + 'px';
      li.appendChild(ul);
      
      item.items.forEach(function(each) {
        this_.generateHtmlAndPublish(ul, each, CM.$internal.getNextItemIndex(), true);
      });
    } else {
      this.generateHtmlAndPublish(CM.container, item, index);
    }
  },
  generateHtmlAndPublish: function (parent, item, i, submenu) {
    var html, frag, element, separator = false;
    var classes = CM.Constants.css;
    
    // separator
    if (typeof item === 'string' && item.trim() == '-') {
      html = '<li class="'+ classes.separator +'"><hr></li>';
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
      
      if(item.icon){
        item.classname += ' ' + classes.icon;
        element.setAttribute('style', 'background-image:url('+ item.icon +')');
      }
      
      element.id = 'index' + i;
      element.className = item.classname;
      element.appendChild(frag);
      parent.appendChild(element);
    }
    
    CM.items[i] = {
      id: i,
      submenu: submenu || 0,
      separator: separator,
      callback: item.callback,
      data: item.data || null
    };
    
    // publish to add listener
    events.publish(CM.EventType.ADD_MENU_ENTRY, {
      index: i,
      element: element
    });
    
    return element;
  }
};
