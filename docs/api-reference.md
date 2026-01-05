# API Reference

Complete API documentation for `ol-contextmenu`.

## Constructor

### `new ContextMenu(options)`

Creates a new context menu instance.

**Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Partial<Options>` | `{}` | Configuration options |
| `options.width` | `number` | `150` | Width of the menu in pixels |
| `options.defaultItems` | `boolean` | `true` | Include default zoom items |
| `options.items` | `Item[]` | `[]` | Array of custom menu items |
| `options.eventType` | `EventTypes` | `'contextmenu'` | Event that triggers the menu |
| `options.scrollAt` | `number` | `4` | Number of items before menu becomes scrollable |

**Example:**

```javascript
const contextmenu = new ContextMenu({
    width: 200,
    defaultItems: false,
    eventType: 'click',
    items: [
        { text: 'Item 1', callback: fn1 },
        { text: 'Item 2', callback: fn2 },
    ],
});
```

## Methods

### `clear()`

Removes all items from the menu.

**Returns:** `void`

**Example:**

```javascript
contextmenu.clear();
```

---

### `closeMenu()`

Closes the context menu programmatically.

**Returns:** `void`

**Example:**

```javascript
contextmenu.closeMenu();
```

---

### `extend(items)`

Adds multiple items to the end of the menu.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `items` | `Item[]` | Array of items to add |

**Returns:** `void`

**Example:**

```javascript
contextmenu.extend([
    { text: 'New Item 1', callback: fn1 },
    '-',
    { text: 'New Item 2', callback: fn2 },
]);
```

---

### `push(item)`

Adds a single item to the end of the menu.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `item` | `Item \| '-'` | Item to add (or separator) |

**Returns:** `void`

**Example:**

```javascript
contextmenu.push({ text: 'New Item', callback: fn });
contextmenu.push('-'); // Add separator
```

---

### `pop()`

Removes the last item from the menu.

**Returns:** `void`

**Example:**

```javascript
contextmenu.pop();
```

---

### `shift()`

Removes the first item from the menu.

**Returns:** `void`

**Example:**

```javascript
contextmenu.shift();
```

---

### `getDefaultItems()`

Returns the array of default menu items (Zoom In/Zoom Out).

**Returns:** `SingleItem[]`

**Example:**

```javascript
const defaults = contextmenu.getDefaultItems();
console.log(defaults);
// [
//   { text: 'Zoom In', callback: fn, ... },
//   { text: 'Zoom Out', callback: fn, ... }
// ]
```

---

### `isOpen()`

Checks whether the menu is currently open.

**Returns:** `boolean`

**Example:**

```javascript
if (contextmenu.isOpen()) {
    console.log('Menu is open');
}
```

---

### `updatePosition(pixel)`

Updates the position of the menu.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `pixel` | `[number, number]` | New pixel coordinates |

**Returns:** `void`

**Example:**

```javascript
contextmenu.updatePosition([100, 200]);
```

---

### `enable()`

Enables the context menu (allows it to open).

**Returns:** `void`

**Example:**

```javascript
contextmenu.enable();
```

---

### `disable()`

Disables the context menu (prevents it from opening).

**Returns:** `void`

**Example:**

```javascript
contextmenu.disable();
```

---

### `countItems()`

Returns the number of items in the menu (excluding separators and submenu items).

**Returns:** `number`

**Example:**

```javascript
const count = contextmenu.countItems();
console.log(`Menu has ${count} items`);
```

## Events

The context menu extends OpenLayers' `Control` class and emits custom events.

### `beforeopen`

Fired before the menu opens. Can be used to conditionally prevent opening.

**Event Data:**

```typescript
{
    map: Map,
    pixel: [number, number],
    coordinate: Coordinate,
    originalEvent: MouseEvent,
    type: 'beforeopen'
}
```

**Example:**

```javascript
contextmenu.on('beforeopen', (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (ft) => ft);

    if (!feature) {
        contextmenu.disable(); // Don't open if no feature
    } else {
        contextmenu.enable();
    }
});
```

---

### `open`

Fired when the menu opens.

**Event Data:**

```typescript
{
    map: Map,
    pixel: [number, number],
    coordinate: Coordinate,
    originalEvent: MouseEvent,
    type: 'open'
}
```

**Example:**

```javascript
contextmenu.on('open', (evt) => {
    console.log('Menu opened at:', evt.coordinate);

    // Modify menu based on context
    const feature = map.forEachFeatureAtPixel(evt.pixel, (ft) => ft);
    if (feature) {
        // Add feature-specific items
    }
});
```

---

### `close`

Fired when the menu closes.

**Event Data:** `BaseEvent`

**Example:**

```javascript
contextmenu.on('close', () => {
    console.log('Menu closed');
});
```

## Types

### `Item`

Union type for menu items:

```typescript
type Item = SingleItem | ItemWithNested | ItemSeparator;
```

### `SingleItem`

A standard menu item with a callback:

```typescript
interface SingleItem {
    text: string;
    callback: (obj: CallbackObject, map: Map) => void;
    icon?: string;
    classname?: string;
    data?: any;
}
```

### `ItemWithNested`

A menu item with nested subitems:

```typescript
interface ItemWithNested {
    text: string;
    items: Item[];
    icon?: string;
    classname?: string;
}
```

### `ItemSeparator`

A menu separator:

```typescript
type ItemSeparator = '-';
```

### `CallbackObject`

Data passed to item callbacks:

```typescript
interface CallbackObject {
    coordinate: Coordinate;
    data: unknown;
}
```

### `Options`

Configuration options for the constructor:

```typescript
interface Options {
    width: number;
    defaultItems: boolean;
    items: Item[];
    eventType: EventTypes;
    scrollAt: number;
}
```

**Note:** The constructor accepts `Partial<Options>`, so all fields are optional when creating an instance. The type definition above shows the complete options object with defaults applied.

### `EventTypes`

Possible event types:

```typescript
enum EventTypes {
    CONTEXTMENU = 'contextmenu',
    CLICK = 'click',
    DBLCLICK = 'dblclick',
}
```

## Examples

### Dynamic Menu Based on Feature

```javascript
let currentFeature = null;

contextmenu.on('beforeopen', (evt) => {
    currentFeature = map.forEachFeatureAtPixel(evt.pixel, (ft) => ft);

    contextmenu.clear();

    if (currentFeature) {
        contextmenu.extend([
            {
                text: 'Delete Feature',
                callback: () => {
                    vectorSource.removeFeature(currentFeature);
                },
            },
            {
                text: 'Feature Properties',
                callback: () => {
                    console.log(currentFeature.getProperties());
                },
            },
        ]);
    } else {
        contextmenu.extend([
            {
                text: 'Add Marker Here',
                callback: (obj) => {
                    const marker = new Feature({
                        geometry: new Point(obj.coordinate),
                    });
                    vectorSource.addFeature(marker);
                },
            },
        ]);
    }
});
```

### Using Different Event Types

```javascript
// Trigger on single click instead of right-click
const contextmenu = new ContextMenu({
    eventType: 'click',
    items: [/* ... */],
});

// Trigger on double-click
const contextmenu2 = new ContextMenu({
    eventType: 'dblclick',
    items: [/* ... */],
});
```

### Custom Data in Callbacks

```javascript
const items = [
    {
        text: 'Process Data',
        data: { id: 123, type: 'custom' },
        callback: (obj) => {
            console.log('Custom data:', obj.data);
            // Output: { id: 123, type: 'custom' }
        },
    },
];
```

## See Also

- [Getting Started](./getting-started.md)
- [TypeScript Guide](./typescript.md)
- [Examples & Recipes](./examples.md)
