import * as vars from '../../config/vars.json';
import utils from './utils';

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

export const defaultOptions = {
  width: 150,
  default_items: true
};

// internal pub/sub
export const events = utils.events();

export const defaultItems = [
  {
    text: 'Zoom In',
    classname: [
      vars.namespace + vars.zoom_in_class, 
      vars.namespace + vars.icon_class
    ].join(' '),
    callback: function(obj, map){
      var
        view = map.getView(),
        pan = ol.animation.pan({
          duration: 1000,
          source: view.getCenter()
        }),
        zoom = ol.animation.zoom({
          duration: 1000,
          resolution: view.getResolution()
        })
      ;

      map.beforeRender(pan, zoom);
      view.setCenter(obj.coordinate);
      view.setZoom(+view.getZoom() + 1);
    }
  },
  {
    text: 'Zoom Out',
    classname: [
      vars.namespace + vars.zoom_out_class,
      vars.namespace + vars.icon_class
    ].join(' '),
    callback: function(obj, map){
      var
        view = map.getView(),
        pan = ol.animation.pan({
          duration: 1000,
          source: view.getCenter()
        }),
        zoom = ol.animation.zoom({
          duration: 1000,
          resolution: view.getResolution()
        })
      ;
      map.beforeRender(pan, zoom);
      view.setCenter(obj.coordinate);
      view.setZoom(+view.getZoom() - 1);
    }
  }
];