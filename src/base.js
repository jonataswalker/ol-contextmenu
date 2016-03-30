
/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object|undefined} opt_options Options.
 */
CM.Base = function(opt_options){
  
  var defaults = {
    width: 150,
    default_items: true
  };
  this.options = utils.mergeOptions(defaults, opt_options);
  this.$html = new CM.Html(this);
  this.container = this.$html.container;
  this.$internal = new CM.Internal(this);
  
  ol.control.Control.call(this, {
    element: this.container
  });
};
ol.inherits(CM.Base, ol.control.Control);

/**
 * Remove all elements from the menu.
 */
CM.Base.prototype.clear = function() {
  utils.removeAllChildren(this.container);
};

/**
 * Add items to the menu. This pushes each item in the provided array
 * to the end of the menu.
 * @param {Array} arr Array.
 */
CM.Base.prototype.extend = function(arr) {
  utils.assert(Array.isArray(arr), '@param `arr` should be an Array.');
  arr.forEach(this.push, this);
};

/**
 * Insert the provided item at the end of the menu.
 * @param {Object|String} item Item.
 */
CM.Base.prototype.push = function(item) {
  utils.assert(utils.isDefAndNotNull(item), '@param `item` must be informed.');
  this.$html.addMenuEntry(item, this.$internal.getNextItemIndex());
};

/**
 * Remove the last item of the menu.
 */
CM.Base.prototype.pop = function() {
  var last = this.container.lastChild;
  if (last) {
    this.container.removeChild(last);
  }
};

/**
 * @return {Array} Returns default items
 */
CM.Base.prototype.getDefaultItems = function() {
  return CM.defaultItems;
};

/**
 * Not supposed to be used on app.
 */
CM.Base.prototype.setMap = function(map) {
  ol.control.Control.prototype.setMap.call(this, map);
  //http://gis.stackexchange.com/a/136850/50718
  // let's start since now we have the map
  this.$internal.init(map);
};
