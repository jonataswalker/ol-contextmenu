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
    this.map_element = undefined;
    /**
     * @type {ol.Coordinate}
     */
    this.coordinate_clicked = undefined;
    /**
     * @type {ol.Pixel}
     */
    this.pixel_clicked = undefined;
    /**
     * @type {Number}
     */
    this.counter = 0;
    /**
     * @type {Number}
     */
    this.lineHeight = 0;
    /**
     * @type {Object}
     */
    this.items = {};
    /**
     * @type {Object}
     */
    this.submenu = {
      left: this.Base.options.width - 15 + 'px',
      last_left: '' // string + px
    };
    /**
     * @type {Function}
     */
    this.event_handler = this.handleEvent.bind(this);

    return this;
  }

  init(map) {
    this.map = map;
    this.map_element = map.getTargetElement();
    this.setListeners();
    this.Base.constructor.Html.createMenu();

    this.lineHeight = this.getItemsLength() > 0 ?
      this.Base.container.offsetHeight / this.getItemsLength() :
      this.Base.constructor.Html.cloneAndGetLineHeight();
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
    return this.pixel_clicked;
  }

  getCoordinateClicked() {
    return this.coordinate_clicked;
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
        // submenus <ul>
        uls = utils.find('li.' + CLASSNAME.submenu + '>ul',
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

    if (uls.length) {
      if (space_left_w < (menu_size.w * 2)) {
        // no space (at right) for submenu
        // position them at left
        this.submenu.last_left = `-${menu_size.w}px`;
      } else {
        this.submenu.last_left = this.submenu.left;
      }
      uls.forEach(ul => {
        ul.style.left = this.submenu.last_left;
      });
    }
  }

  openMenu(pixel, coordinate) {
    this.positionContainer(pixel);

    this.Base.dispatchEvent({
      type: EVENT_TYPE.OPEN,
      pixel: pixel,
      coordinate: coordinate
    });
  }

  closeMenu() {
    utils.addClass(this.Base.container, CLASSNAME.hidden);
    this.Base.dispatchEvent({
      type: EVENT_TYPE.CLOSE
    });
  }

  getNextItemIndex() {
    return ++this.counter;
  }

  setListeners() {
    this.map_element.addEventListener('contextmenu', this.event_handler, false);
  }

  removeListeners() {
    this.map_element.removeEventListener(
        'contextmenu', this.event_handler, false);
  }

  handleEvent(evt) {
    const this_ = this;

    this_.coordinate_clicked = this.map.getEventCoordinate(evt);
    this_.pixel_clicked = this.map.getEventPixel(evt);

    this_.Base.dispatchEvent({
      type: EVENT_TYPE.BEFOREOPEN,
      pixel: this_.pixel_clicked,
      coordinate: this_.coordinate_clicked
    });

    if (this_.Base.disabled) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();
    this_.openMenu(this_.pixel_clicked, this_.coordinate_clicked);

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
