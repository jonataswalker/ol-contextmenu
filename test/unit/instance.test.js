// const ol = require('openlayers');
// const ContextMenu = require('../../dist/ol-contextmenu');
const { DEFAULT_OPTIONS, DEFAULT_ITEMS } = require('../../konstants');
const { toJSON } = require('./helpers/functions');
const {
  options,
  items,
  items2,
  dataCenter
} = require('./helpers/data');

// import Control from 'ol/control/control';
import ContextMenu from '../../';

// jest.mock('ol/control/control');
//
// beforeEach(() => {
//   // Clear all instances and calls to constructor and all methods:
//   Control.mockClear();
// });

describe('Instance of', () => {
  const menu = new ContextMenu();

  test('is a constructor', () => {
    expect(menu).toBeInstanceOf(ContextMenu);
  });

  // https://github.com/facebook/jest/issues/5331
  // test('is ol.control.Control', () => {
  // expect(menu).toBeInstanceOf(Control);
  // });
});

describe('Instance options', () => {
  const menu = new ContextMenu();
  const menuWithOptions = new ContextMenu(options);

  test('default options', () => {
    expect(menu.options).toEqual(DEFAULT_OPTIONS);
  });

  test('merge options', () => {
    expect(menuWithOptions.options).toMatchObject(options);
  });
});

describe('Instance methods', () => {
  const menu = new ContextMenu();

  test('getDefaultItems()', () => {
    expect(toJSON(menu.getDefaultItems())).toEqual(toJSON(DEFAULT_ITEMS));
  });

  test('countItems()', () => {
    menu.clear();
    expect(menu.countItems()).toBe(0);
    menu.push(items2[0]);
    expect(menu.countItems()).toBe(1);
  });

  test('push()', () => {
    menu.clear();
    menu.push(items2[0]);
    expect(menu.countItems()).toBe(1);
  });

  test('pop()', () => {
    menu.clear();
    menu.extend(items);
    menu.pop();
    expect(menu.countItems()).toBe(items.length - 1);

    const keys = Object.keys(menu.Internal.items);
    const last = menu.Internal.items[keys[keys.length - 1]];
    expect(last.data).toBe(dataCenter);
  });

  test('shift()', () => {
    menu.clear();
    menu.extend(items);
    menu.shift();
    expect(menu.countItems()).toBe(items.length - 1);

    const keys = Object.keys(menu.Internal.items);
    const first = menu.Internal.items[keys[0]];
    expect(first.data).toBe(dataCenter);
  });

  test('extend()', () => {
    menu.clear();
    menu.extend(items);
    expect(menu.countItems()).toBe(items.length);

    menu.extend(items2);
    expect(menu.countItems()).toBe(items.length + items2.length);
  });

  test('clear()', () => {
    menu.extend(items);
    menu.clear();
    expect(menu.countItems()).toBe(0);
  });
});

describe('Throw errors', () => {
  test('wrong options type', () => {
    expect(() => { new ContextMenu('foo') }).toThrowError();
  });
});
