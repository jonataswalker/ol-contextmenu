const ol = require('openlayers');
const ContextMenu = require('../../dist/ol-contextmenu');
const { DEFAULT_OPTIONS, DEFAULT_ITEMS } = require('../../konstants');
const { toJSON, countItems } = require('./helpers/functions');
const {
  options,
  items,
  items2,
  dataCenter
} = require('./helpers/data');


describe('Instance of', () => {
  const menu = new ContextMenu();

  test('is a constructor', () => {
    expect(menu instanceof ContextMenu).toBeTruthy();
  });

  test('is ol.control.Control', () => {
    expect(menu instanceof ol.control.Control).toBeTruthy();
  });
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

  test('push()', () => {
    menu.clear();
    menu.push(items2[0]);
    expect(countItems(menu.Internal.items)).toBe(1);
  });

  test('pop()', () => {
    menu.clear();
    menu.extend(items);
    menu.pop();
    expect(countItems(menu.Internal.items)).toBe(items.length - 1);

    const keys = Object.keys(menu.Internal.items);
    const last = menu.Internal.items[keys[keys.length - 1]];
    expect(last.data).toBe(dataCenter);
  });

  test('shift()', () => {
    menu.clear();
    menu.extend(items);
    menu.shift();
    expect(countItems(menu.Internal.items)).toBe(items.length - 1);

    const keys = Object.keys(menu.Internal.items);
    const first = menu.Internal.items[keys[0]];
    expect(first.data).toBe(dataCenter);
  });

  test('extend()', () => {
    menu.clear();
    menu.extend(items);
    expect(countItems(menu.Internal.items)).toBe(items.length);

    menu.extend(items2);
    expect(countItems(menu.Internal.items)).toBe(items.length + items2.length);
  });

  test('clear()', () => {
    menu.extend(items);
    menu.clear();
    expect(countItems(menu.Internal.items)).toBe(0);
  });


});

describe('Throw errors', () => {
  test('wrong options type', () => {
    expect(() => { new ContextMenu('foo') }).toThrowError();
  });
});
