import Control from 'ol/control/control';
import { DEFAULT_OPTIONS, DEFAULT_ITEMS } from 'konstants';
import { Internal } from './internal';
import { Html } from './html';
import { assert, mergeOptions, isDefAndNotNull } from 'helpers/mix';

/**
 * @class Base
 * @extends {ol.control.Control}
 */
export default class Base extends Control {
  /**
   * @constructor
   * @param {object|undefined} opt_options Options.
   */
  constructor(opt_options = {}) {
    assert(
      typeof opt_options == 'object',
      '@param `opt_options` should be object type!'
    );

    this.options = mergeOptions(DEFAULT_OPTIONS, opt_options);
    this.disabled = false;

    this.Internal = new Internal(this);
    this.Html = new Html(this);

    super({ element: this.container });
  }

  /**
   * Remove all elements from the menu.
   */
  clear() {
    Object.keys(this.Internal.items)
      .forEach(this.Html.removeMenuEntry, this.Html);
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
   * @return {Number} Returns how many items
   */
  countItems() {
    return Object.keys(this.Internal.items).length;
  }

  /**
   * Add items to the menu. This pushes each item in the provided array
   * to the end of the menu.
   * @param {Array} arr Array.
   */
  extend(arr) {
    assert(Array.isArray(arr), '@param `arr` should be an Array.');
    arr.forEach(this.push, this);
  }

  isOpen() {
    return this.Internal.opened;
  }

  /**
   * Update the menu's position.
   */
  updatePosition(pixel) {
    assert(Array.isArray(pixel), '@param `pixel` should be an Array.');

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
    assert(isDefAndNotNull(item), '@param `item` must be informed.');
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

    Control.prototype.setMap.call(this, map);

    if (map) {
      // let's start since now we have the map
      this.Internal.init(map, this);
    } else {
      // I'm removed from the map - remove listeners
      this.Internal.removeListeners();
    }
  }
}
