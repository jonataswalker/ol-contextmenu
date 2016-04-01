
/**
 * Helper
 */
var utils = {
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
  isNumeric: function(str){
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
  addClass: function(element, classname, timeout){
    if(Array.isArray(element)){
      element.forEach(function(each){
        utils.addClass(each, classname);
      });
      return;
    }
    
    var 
      array = (Array.isArray(classname)) ? classname : classname.split(/\s+/),
      i = array.length
    ;
    while(i--){
      if(!utils.hasClass(element, array[i])) {
        utils._addClass(element, array[i], timeout);
      }
    }
  },
  _addClass: function(el, c, timeout){
    // use native if available
    if (el.classList) {
      el.classList.add(c);
    } else {
      el.className = (el.className + ' ' + c).trim();
    }
    
    if(timeout && utils.isNumeric(timeout)){
      window.setTimeout(function(){
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
  removeClass: function(element, classname, timeout){
    if(Array.isArray(element)){
      element.forEach(function(each){
        utils.removeClass(each, classname, timeout);
      });
      return;
    }
    
    var 
      array = (Array.isArray(classname)) ? classname : classname.split(/\s+/),
      i = array.length
    ;
    while(i--){
      if(utils.hasClass(element, array[i])) {
        utils._removeClass(element, array[i], timeout);
      }
    }
  },
  _removeClass: function(el, c, timeout){
    if (el.classList){
      el.classList.remove(c);
    } else {
      el.className = (el.className.replace(utils.classRegex(c), ' ')).trim();
    }
    if(timeout && utils.isNumeric(timeout)){
      window.setTimeout(function() {
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
  toggleClass: function(element, classname){
    if(Array.isArray(element)) {
      element.forEach(function(each) {
        utils.toggleClass(each, classname);
      });
      return;
    }
    
    // use native if available
    if(element.classList) {
      element.classList.toggle(classname);
    } else {
      if(utils.hasClass(element, classname)){
        utils._removeClass(element, classname);
      } else {
        utils._addClass(element, classname);
      }
    }
  },
  $: function(id){
    id = (id[0] === '#') ? id.substr(1, id.length) : id;
    return document.getElementById(id);
  },
  isElement: function(obj){
    // DOM, Level2
    if ('HTMLElement' in window) {
      return (!!obj && obj instanceof HTMLElement);
    }
    // Older browsers
    return (!!obj && typeof obj === 'object' && 
    obj.nodeType === 1 && !!obj.nodeName);
  },
  /*
  * Abstraction to querySelectorAll for increased 
  * performance and greater usability
  * @param {String} selector
  * @param {Element} context (optional)
  * @param {Boolean} find_all (optional)
  * @return (find_all) {Element} : {Array}
  */
  find: function(selector, context, find_all){
    var simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/, 
        periodRe = /\./g, 
        slice = Array.prototype.slice,
        matches = [];

    context = context || window.document;
    
    // Redirect call to the more performant function 
    // if it's a simple selector and return an array
    // for easier usage
    if(simpleRe.test(selector)){
      switch(selector[0]){
        case '#':
          matches = [utils.$(selector.substr(1))];
          break;
        case '.':
          matches = slice.call(context.getElementsByClassName(
            selector.substr(1).replace(periodRe, ' ')));
          break;
        default:
          matches = slice.call(context.getElementsByTagName(selector));
      }
    } else{
      // If not a simple selector, query the DOM as usual 
      // and return an array for easier usage
      matches = slice.call(context.querySelectorAll(selector));
    }
    
    return (find_all) ? matches : matches[0];
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
    while ((node = collection[0]))
      node.parentNode.removeChild(node);
  },
  getChildren: function(node, tag){
    return [].filter.call(node.childNodes, function(el) {
      return (tag) ? 
        el.nodeType == 1 && el.tagName.toLowerCase() == tag :
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
      .replace(/'/g, '&#039;');
  },
  /**
  * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
  * @returns obj3 a new object based on obj1 and obj2
  */
  mergeOptions: function(obj1, obj2){
    var obj3 = {};
    for (var attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
    for (var attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
    return obj3;
  },
  escapeRegExp: function (str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },
  /**
    * Does str contain test?
    * @param {String} test
    * @param {String} str
    * @returns Boolean
  */
  test: function (test, str) {
    var regex = new RegExp(utils.escapeRegExp(test));
    return regex.test(str);
  },
  createElement: function(node, html){
    var elem;
    if(Array.isArray(node)) {
      elem = document.createElement(node[0]);
      
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
    } else {
      elem = document.createElement(node);
    }
    elem.innerHTML = html;
    var frag = document.createDocumentFragment();
    
    while (elem.childNodes[0]) {
      frag.appendChild(elem.childNodes[0]);
    }
    elem.appendChild(frag);
    return elem;
  },
  createFragment: function(html) {
    var
      frag = document.createDocumentFragment(),
      temp = document.createElement('div')
    ;
    temp.innerHTML = html;
    while (temp.firstChild) {
      frag.appendChild(temp.firstChild);
    }
    return frag;
  },
  clone: function(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null === obj || 'object' != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = utils.clone(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = utils.clone(obj[attr]);
        }
      }
      return copy;
    }

    throw new Error('Unable to copy obj! Its type is not supported.');
  },
  isDefAndNotNull: function(val) {
    // Note that undefined == null.
    /* jshint eqnull:true */
    return val != null;
  },
  assert: function(condition, message) {
    if (!condition) {
      message = message || 'Assertion failed';
      if (typeof Error !== 'undefined') {
        throw new Error(message);
      }
      throw message; // Fallback
    }
  },
  assertEqual: function(a, b, message) {
    if (a != b) {
      throw new Error(message + ' mismatch: ' + a + ' != ' + b);
    }
  }
};

/**
 * Pub/Sub
 */
var events = (function() {
  var topics = {};
  var hOP = topics.hasOwnProperty;
  
  return {
    subscribe: function(topic, listener) {
      // Create the topic's object if not yet created
      if(!hOP.call(topics, topic)) topics[topic] = [];
      
      // Add the listener to queue
      var index = topics[topic].push(listener) -1;
      
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
      if(!hOP.call(topics, topic)) return;
      
      // Cycle through topics queue, fire!
      topics[topic].forEach(function(item) {
        item(info !== undefined ? info : {});
      });
    }
  };
})();
