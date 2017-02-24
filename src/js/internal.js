import { CLASSNAME, eventType as EVENT_TYPE } from './constants';
import utils from './utils';

/**
 * @class Internal
 */
export class Internal {
  /**
   * @constructor
   * @param {Function} base Base class.
   */
  constructor(base) {
    /**
    * @type {ol.control.Control}
    */
    this.Base = base;
    /**
      * @type {ol.Map}
      */
    this.map = undefined;
    /**
      * @type {Element}
      */
    this.viewport = undefined;
    /**
      * @type {ol.Coordinate}
      */
    this.coordinateClicked = undefined;
    /**
      * @type {ol.Pixel}
      */
    this.pixelClicked = undefined;
    /**
      * @type {Number}
      */
    this.lineHeight = 0;
    /**
      * @type {Object}
      */
    this.items = {};
    /**
      * @type {Boolean}
      */
    this.opened = false;
    /**
      * @type {Object}
      */
    this.submenu = {
      left: base.options.width - 15 + 'px',
      lastLeft: '' // string + px
    };
    /**
      * @type {Function}
      */
    this.eventHandler = this.handleEvent.bind(this);
    return this;
  }

  init(map) {
    this.map = map;
    this.viewport = map.getViewport();
    this.setListeners();
    this.Base.Html.createMenu();

    this.lineHeight = this.getItemsLength() > 0
      ? this.Base.container.offsetHeight / this.getItemsLength()
      : this.Base.Html.cloneAndGetLineHeight();
  }

  getItemsLength() {
    let count = 0;
    Object.keys(this.items).forEach(k => {
      if (this.items[k].submenu || this.items[k].separator) return;
      count++;
    });
    return count;
  }

  getPixelClicked() {
    return this.pixelClicked;
  }

  getCoordinateClicked() {
    return this.coordinateClicked;
  }

  positionContainer(pixel) {
    let map_size = this.map.getSize(),
        map_w = map_size[0],
        map_h = map_size[1],
        // how much (width) space left over
        space_left_h = map_h - pixel[1],
        // how much (height) space left over
        space_left_w = map_w - pixel[0],
        menu_size = {
          w: this.Base.container.offsetWidth,
          // a cheap way to recalculate container height
          // since offsetHeight is like cached
          h: Math.round(this.lineHeight * this.getItemsLength())
        },
        // submenus
        subs = utils.find('li.' + CLASSNAME.submenu + '> div',
            this.Base.container, true);

    if (space_left_w >= menu_size.w) {
      this.Base.container.style.right = 'auto';
      this.Base.container.style.left = `${pixel[0] + 5}px`;
    } else {
      this.Base.container.style.left = 'auto';
      this.Base.container.style.right = '15px';
    }
    // set top or bottom
    if (space_left_h >= menu_size.h) {
      this.Base.container.style.bottom = 'auto';
      this.Base.container.style.top = `${pixel[1] - 10}px`;
    } else {
      this.Base.container.style.top = 'auto';
      this.Base.container.style.bottom = 0;
    }

    utils.removeClass(this.Base.container, CLASSNAME.hidden);

    if (subs.length) {
      if (space_left_w < (menu_size.w * 2)) {
        // no space (at right) for submenu
        // position them at left
        this.submenu.lastLeft = `-${menu_size.w}px`;
      } else {
        this.submenu.lastLeft = this.submenu.left;
      }
      subs.forEach(sub => {
        // is there enough space for submenu height?
        let viewport = utils.getViewportSize();
        let sub_offset = utils.offset(sub);
        let sub_height = sub_offset.height;
        let sub_top = space_left_h - sub_height;

        if (sub_top < 0) {
          sub_top = sub_height - (viewport.h - sub_offset.top);
          sub.style.top = `-${sub_top}px`;
        }
        sub.style.left = this.submenu.lastLeft;
      });
    }
  }

  openMenu(pixel, coordinate) {
    this.Base.dispatchEvent({
      type: EVENT_TYPE.OPEN,
      pixel: pixel,
      coordinate: coordinate
    });
    this.opened = true;
    this.positionContainer(pixel);
  }

  closeMenu() {
    this.opened = false;
    utils.addClass(this.Base.container, CLASSNAME.hidden);
    this.Base.dispatchEvent({
      type: EVENT_TYPE.CLOSE
    });
  }

  setListeners() {
    this.viewport.addEventListener(
        this.Base.options.eventType, this.eventHandler, false);
  }

  removeListeners() {
    this.viewport.removeEventListener(
        this.Base.options.eventType, this.eventHandler, false);
  }

  handleEvent(evt) {
    const this_ = this;

    this.coordinateClicked = this.map.getEventCoordinate(evt);
    this.pixelClicked = this.map.getEventPixel(evt);

    this.Base.dispatchEvent({
      type: EVENT_TYPE.BEFOREOPEN,
      pixel: this.pixelClicked,
      coordinate: this.coordinateClicked
    });

    if (this.Base.disabled) {
      return;
    }
    if (this.Base.options.eventType === EVENT_TYPE.CONTEXTMENU) {
      // don't be intrusive with other event types
      evt.stopPropagation();
      evt.preventDefault();
    }
    this.openMenu(this.pixelClicked, this.coordinateClicked);

    //one-time fire
    evt.target.addEventListener('mousedown', {
      handleEvent: function (e) {
        this_.closeMenu();
        evt.target.removeEventListener(e.type, this, false);
      }
    }, false);
  }

  setItemListener(li, index) {
    const this_ = this;
    if (li && typeof this.items[index].callback === 'function') {
      (function (callback) {
        li.addEventListener('click', function (evt) {
          evt.preventDefault();
          let obj = {
            coordinate: this_.getCoordinateClicked(),
            data: this_.items[index].data || null
          };
          this_.closeMenu();
          callback(obj, this_.map);
        }, false);
      })(this.items[index].callback);
    }
  }
}
