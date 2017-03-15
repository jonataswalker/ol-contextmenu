import * as _VARS from '../../config/vars.json';
import ol from 'openlayers';

export const eventType = {
  /**
   * Triggered before context menu is openned.
   */
  BEFOREOPEN: 'beforeopen',
  /**
   * Triggered when context menu is openned.
   */
  OPEN: 'open',
  /**
   * Triggered when context menu is closed.
   */
  CLOSE: 'close',
  /**
   * Internal. Triggered when a menu entry is added.
   */
  ADD_MENU_ENTRY: 'add-menu-entry',
  /**
   * Internal.
   */
  CONTEXTMENU: 'contextmenu',
  /**
   * Internal.
   */
  HOVER: 'mouseover'
};

export const VARS = _VARS;

/**
 * DOM Elements classname
 */
export const CLASSNAME = {
  container       : _VARS.namespace + _VARS.container_class,
  separator       : _VARS.namespace + _VARS.separator_class,
  submenu         : _VARS.namespace + _VARS.submenu_class,
  hidden          : _VARS.namespace + _VARS.hidden_class,
  icon            : _VARS.namespace + _VARS.icon_class,
  zoomIn          : _VARS.namespace + _VARS.zoom_in_class,
  zoomOut         : _VARS.namespace + _VARS.zoom_out_class,
  OL_unselectable : _VARS.ol_unselectable_class
};

export const defaultOptions = {
  width: 150,
  scrollAt: 4,
  eventType: eventType.CONTEXTMENU,
  defaultItems: true
};

export const defaultItems = [
  {
    text: 'Zoom In',
    classname: [CLASSNAME.zoomIn, CLASSNAME.icon].join(' '),
    callback: (obj, map) => {
      const view = map.getView();
      view.animate({
        zoom: +view.getZoom() + 1,
        duration: 700,
        center: obj.coordinate
      });
    }
  },
  {
    text: 'Zoom Out',
    classname: [CLASSNAME.zoomOut, CLASSNAME.icon].join(' '),
    callback: (obj, map) => {
      const view = map.getView();
      view.animate({
        zoom: +view.getZoom() - 1,
        duration: 700,
        center: obj.coordinate
      });
    }
  }
];
