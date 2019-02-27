import cssVars from './cssVars';

export const CSS_VARS = cssVars;

export const EVENT_TYPE = {
  /**
   * Triggered before context menu is open.
   */
  BEFOREOPEN: 'beforeopen',
  /**
   * Triggered when context menu is open.
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
  HOVER: 'mouseover',
};

export const DEFAULT_OPTIONS = {
  width: 150,
  scrollAt: 4,
  eventType: EVENT_TYPE.CONTEXTMENU,
  defaultItems: true,
};

export const DEFAULT_ITEMS = [
  {
    text: 'Zoom In',
    classname: `${cssVars.zoomIn} ${cssVars.icon}`,
    callback: (obj, map) => {
      const view = map.getView();
      view.animate({
        zoom: +view.getZoom() + 1,
        duration: 700,
        center: obj.coordinate,
      });
    },
  },
  {
    text: 'Zoom Out',
    classname: `${cssVars.zoomOut} ${cssVars.icon}`,
    callback: (obj, map) => {
      const view = map.getView();
      view.animate({
        zoom: +view.getZoom() - 1,
        duration: 700,
        center: obj.coordinate,
      });
    },
  },
];
