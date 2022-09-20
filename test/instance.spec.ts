import { DEFAULT_ITEMS, DEFAULT_OPTIONS } from '../src/constants';
import ContextMenu from '../src/main';
import { Item } from '../src/types';

const items: Item[] = [
    '-',
    {
        text: 'Center map here',
        classname: 'bold',
        data: 'data-center',
        callback: () => {},
    },
    {
        text: 'Add a Marker',
        data: 'data-marker',
        callback: () => {},
    },
];
const options = {
    items,
    width: 300,
};
const toJSON = (obj) => JSON.stringify(obj);

describe('Constructor', () => {
    it('instance of', () => {
        const menu = new ContextMenu();

        expect(menu).toBeInstanceOf(ContextMenu);
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

    test('countItems()', () => {
        menu.clear();
        expect(menu.countItems()).toBe(0);
        menu.push(items[1]);
        expect(menu.countItems()).toBe(1);
    });

    test('push()', () => {
        menu.clear();
        menu.push(items[0]);
        expect(menu.countItems()).toBe(1);
    });

    test('pop()', () => {
        menu.clear();
        menu.extend(items);
        menu.pop();
        expect(menu.countItems()).toBe(items.length - 1);
    });

    test('shift()', () => {
        menu.clear();
        menu.extend(items);
        menu.shift();
        expect(menu.countItems()).toBe(items.length - 1);
    });

    test('extend()', () => {
        menu.clear();
        menu.extend(items);
        expect(menu.countItems()).toBe(items.length);

        menu.extend([{ text: 'Foo', callback: () => {} }]);
        expect(menu.countItems()).toBe(items.length + 1);
    });

    test('clear()', () => {
        menu.extend(items);
        menu.clear();
        expect(menu.countItems()).toBe(0);
    });
});

describe('Throw errors', () => {
    test('wrong options type', () => {
        expect(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            // eslint-disable-next-line no-new
            new ContextMenu('foo');
        }).toThrow();
    });
});
