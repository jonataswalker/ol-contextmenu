import {
  defaultOptions as DEFAULT_OPTIONS,
  defaultItems as DEFAULT_ITEMS
} from './constants';

import { Internal } from './internal';
import { Html } from './html';
import utils from './utils';

/**
 * @class Base
 * @extends {ol.control.Control}
 */
export default class Base extends ol.control.Control {
  /**
   * @constructor
   * @param {object|undefined} opt_options Options.
   */
  constructor(opt_options = {}) {
    utils.assert(typeof opt_options == 'object',
      '@param `opt_options` should be object type!'
    );

    // keep old `default_items` compatibility
    if ('default_items' in opt_options) {
      DEFAULT_OPTIONS.defaultItems = opt_options.default_items;
    }
    this.options = utils.mergeOptions(DEFAULT_OPTIONS, opt_options);
    this.disabled = false;

    this.Internal = new Internal(this);
    this.Html = new Html(this);

    super({
      element: this.container
    });
  }

  /**
   * Remove all elements from the menu.
   */
  clear() {
    Object.keys(this.Internal.items).forEach(k => {
      this.Html.removeMenuEntry(k);
    });
  }

  /**
   * Open the menu programmatically.
   */
  open(pixel) {
    this.Internal.openMenu(pixel);
  }

  /**
   * Close the menu programmatically.
   */
  close() {
    this.Internal.closeMenu();
  }

  /**
   * Enable menu
   */
  enable() {
    this.disabled = false;
  }

  /**
   * Disable menu
   */
  disable() {
    this.disabled = true;
  }

  /**
   * @return {Array} Returns default items
   */
  getDefaultItems() {
    return DEFAULT_ITEMS;
  }

  /**
   * Add items to the menu. This pushes each item in the provided array
   * to the end of the menu.
   * @param {Array} arr Array.
   */
  extend(arr) {
    utils.assert(Array.isArray(arr), '@param `arr` should be an Array.');
    arr.forEach(this.push, this);
  }

  /**
   * bad english
   * keep it (for a while) to not break changes
   */
  isOpened() {
    return this.isOpen();
  }

  isOpen() {
    return this.Internal.opened;
  }

  /**
   * Update the menu's position.
   */
  updatePosition(pixel) {
    utils.assert(Array.isArray(pixel), '@param `pixel` should be an Array.');
    if (this.isOpen()) {
      this.Internal.positionContainer(pixel);
    }
  }

  /**
   * Remove the last item of the menu.
   */
  pop() {
    const keys = Object.keys(this.Internal.items);
    this.Html.removeMenuEntry(keys[keys.length - 1]);
  }

  /**
   * Insert the provided item at the end of the menu.
   * @param {Object|String} item Item.
   */
  push(item) {
    utils.assert(
        utils.isDefAndNotNull(item), '@param `item` must be informed.');
    this.Html.addMenuEntry(item);
  }

  /**
   * Remove the first item of the menu.
   */
  shift() {
    this.Html.removeMenuEntry(Object.keys(this.Internal.items)[0]);
  }

  /**
   * Not supposed to be used on app.
   */
  setMap(map) {
    ol.control.Control.prototype.setMap.call(this, map);
    if (map) {
      // let's start since now we have the map
      this.Internal.init(map, this);
    } else {
      // I'm removed from the map - remove listeners
      this.Internal.removeListeners();
    }
  }
}
