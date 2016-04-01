
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
  CM.options = utils.mergeOptions(defaults, opt_options);
  CM.$base = this;
  CM.$html = new CM.Html();
  CM.$internal = new CM.Internal();
  
  ol.control.Control.call(this, {
    element: CM.container
  });
};
ol.inherits(CM.Base, ol.control.Control);

/**
 * Remove all elements from the menu.
 */
CM.Base.prototype.clear = function() {
  Object.keys(CM.items).forEach(function(key) {
    delete CM.items[key];
  });
  utils.removeAllChildren(CM.container);
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
  CM.$html.addMenuEntry(item, CM.$internal.getNextItemIndex());
  CM.$internal.positionContainer(CM.$internal.getPixelClicked());
};

/**
 * Remove the last item of the menu.
 */
CM.Base.prototype.pop = function() {
  var last = CM.container.lastChild;
  if (last) {
    CM.container.removeChild(last);
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
  CM.$internal.init(map);
};
