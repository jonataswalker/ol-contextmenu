import * as _VARS from '../../config/vars.json';

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
  ADD_MENU_ENTRY: 'add-menu-entry'
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
  default_items: true
};

export const defaultItems = [
  {
    text: 'Zoom In',
    classname: [CLASSNAME.zoomIn, CLASSNAME.icon].join(' '),
    callback: (obj, map) => {
      const view = map.getView(),
          pan = ol.animation.pan({
            duration: 1000,
            source: view.getCenter()
          }),
          zoom = ol.animation.zoom({
            duration: 1000,
            resolution: view.getResolution()
          });

      map.beforeRender(pan, zoom);
      view.setCenter(obj.coordinate);
      view.setZoom(+view.getZoom() + 1);
    }
  },
  {
    text: 'Zoom Out',
    classname: [CLASSNAME.zoomOut, CLASSNAME.icon].join(' '),
    callback: (obj, map) => {
      const view = map.getView(),
          pan = ol.animation.pan({
            duration: 1000,
            source: view.getCenter()
          }),
          zoom = ol.animation.zoom({
            duration: 1000,
            resolution: view.getResolution()
          });
      map.beforeRender(pan, zoom);
      view.setCenter(obj.coordinate);
      view.setZoom(+view.getZoom() - 1);
    }
  }
];
