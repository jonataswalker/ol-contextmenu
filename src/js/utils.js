/**
 * @module utils
 * All the helper functions needed in this project
 */
export default {
  isNumeric(str) {
    return /^\d+$/.test(str);
  },
  classRegex(classname) {
    return new RegExp(`(^|\\s+) ${classname} (\\s+|$)`);
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to remove a class.
   */
  addClass(element, classname, timeout) {
    if (Array.isArray(element)) {
      element.forEach(each => { this.addClass(each, classname); });
      return;
    }
    
    const array = (Array.isArray(classname)) ? classname : classname.split(/\s+/);
    let i = array.length;
    
    while(i--) {
      if (!this.hasClass(element, array[i])) {
        this._addClass(element, array[i], timeout);
      }
    }
  },
  _addClass(el, c, timeout) {
    // use native if available
    if (el.classList) {
      el.classList.add(c);
    } else {
      el.className = (el.className +' '+ c).trim();
    }
    
    if (timeout && this.isNumeric(timeout)) {
      window.setTimeout(() => { this._removeClass(el, c); }, timeout);
    }
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to add a class.
   */
  removeClass(element, classname, timeout) {
    if (Array.isArray(element)) {
      element.forEach(each => { this.removeClass(each, classname, timeout); });
      return;
    }
    
    const array = (Array.isArray(classname)) ? classname : classname.split(/\s+/);
    let i = array.length;
    
    while(i--) {
      if (this.hasClass(element, array[i])) {
        this._removeClass(element, array[i], timeout);
      }
    }
  },
  _removeClass(el, c, timeout) {
    if (el.classList) {
      el.classList.remove(c);
    } else {
      el.className = (el.className.replace(this.classRegex(c), ' ')).trim();
    }
    if (timeout && this.isNumeric(timeout)) {
      window.setTimeout(() => {
        this._addClass(el, c);
      }, timeout);
    }
  },
  /**
   * @param {Element} element DOM node.
   * @param {String} classname Classname.
   * @return {Boolean}
   */
  hasClass(element, c) {
    // use native if available
    return (element.classList) ?
      element.classList.contains(c) : this.classRegex(c).test(element.className);
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String} classname Classe.
   */
  toggleClass(element, classname) {
    if (Array.isArray(element)) {
      element.forEach(each => { this.toggleClass(each, classname); });
      return;
    }
    
    // use native if available
    if (element.classList) {
      element.classList.toggle(classname);
    } else {
      if (this.hasClass(element, classname)) {
        this._removeClass(element, classname);
      } else {
        this._addClass(element, classname);
      }
    }
  },
  $(id) {
    id = (id[0] === '#') ? id.substr(1, id.length) : id;
    return document.getElementById(id);
  },
  isElement(obj) {
    // DOM, Level2
    if ('HTMLElement' in window) {
      return (!!obj && obj instanceof HTMLElement);
    }
    // Older browsers
    return (!!obj && typeof obj === 'object' && 
      obj.nodeType === 1 && !!obj.nodeName);
  },
  /**
   * Abstraction to querySelectorAll for increased 
   * performance and greater usability
   * @param {String} selector
   * @param {Element} context (optional)
   * @param {Boolean} find_all (optional)
   * @return (find_all) {Element} : {Array}
   */
  find: function(selector, context = window.document, find_all){
    let simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/, 
        periodRe = /\./g, 
        slice = Array.prototype.slice,
        matches = [];

    // Redirect call to the more performant function 
    // if it's a simple selector and return an array
    // for easier usage
    if(simpleRe.test(selector)){
      switch(selector[0]){
        case '#':
          matches = [this.$(selector.substr(1))];
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
  getAllChildren(node, tag) {
    return [].slice.call(node.getElementsByTagName(tag));
  },
  isEmpty(str) {
    return (!str || 0 === str.length);
  },
  emptyArray(array) {
    while(array.length) array.pop();
  },
  removeAllChildren(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  },
  /**
   * Overwrites obj1's values with obj2's and adds 
   * obj2's if non existent in obj1
   * @returns obj3 a new object based on obj1 and obj2
   */
  mergeOptions(obj1, obj2) {
    let obj3 = {};
    for (let attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
    for (let attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
    return obj3;
  },
  createFragment(html) {
    let frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = html;
    while (temp.firstChild) {
      frag.appendChild(temp.firstChild);
    }
    return frag;
  },
  /**
   * Does str contain test?
   * @param {String} str_test
   * @param {String} str
   * @returns Boolean
   */
  contains(str_test, str) {
    return !!~str.indexOf(str_test);
  },
  isDefAndNotNull(val) {
    // Note that undefined == null.
    return val != null;
  },
  assertEqual(a, b, message) {
    if (a != b) {
      throw new Error(message + ' mismatch: ' + a + ' != ' + b);
    }
  },
  assert(condition, message = 'Assertion failed') {
    if (!condition) {
      if (typeof Error !== 'undefined') {
        throw new Error(message);
      }
      throw message; // Fallback
    }
  },
  events() {
    let topics = {};
    const hOP = topics.hasOwnProperty;
    
    return {
      subscribe: function(topic, listener) {
        // Create the topic's object if not yet created
        if(!hOP.call(topics, topic)) topics[topic] = [];
        
        // Add the listener to queue
        let index = topics[topic].push(listener) -1;
        
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
        topics[topic].forEach(item => {
          item(info !== undefined ? info : {});
        });
      }
    };
  }
};
