import * as _VARS_ from './vars.json';

export const VARS = _VARS_;

export const EVENT_TYPE = {
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

/**
 * DOM Elements classname
 */
export const CLASSNAME = {
  container       : VARS.namespace + VARS.container_class,
  separator       : VARS.namespace + VARS.separator_class,
  submenu         : VARS.namespace + VARS.submenu_class,
  hidden          : VARS.namespace + VARS.hidden_class,
  icon            : VARS.namespace + VARS.icon_class,
  zoomIn          : VARS.namespace + VARS.zoom_in_class,
  zoomOut         : VARS.namespace + VARS.zoom_out_class,
  OL_unselectable : VARS.ol_unselectable_class
};


export const DEFAULT_OPTIONS = {
  width: 150,
  scrollAt: 4,
  eventType: EVENT_TYPE.CONTEXTMENU,
  defaultItems: true
};

export const DEFAULT_ITEMS = [
  {
    text: 'Zoom In',
    classname: `${CLASSNAME.zoomIn} ${CLASSNAME.icon}`,
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
    classname: `${CLASSNAME.zoomOut} ${CLASSNAME.icon}`,
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

