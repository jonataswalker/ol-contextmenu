# TypeScript Guide

`ol-contextmenu` includes full TypeScript support with comprehensive type definitions.

## Installation

```bash
npm install ol ol-contextmenu
```

Type definitions are included automatically—no need for `@types` packages.

📖 For detailed installation instructions, see [Getting Started](./getting-started.md).

## Basic Usage

### Importing

```typescript
import ContextMenu, {
    type Item,
    type Options,
    type SingleItem,
    type CallbackObject,
    type ContextMenuEvent,
} from 'ol-contextmenu';
import type Map from 'ol/Map';
import type { Coordinate } from 'ol/coordinate';
```

**Note:** Use `type` imports for better tree-shaking and to avoid runtime imports.

### Creating a Context Menu

```typescript
import ContextMenu, { type Item } from 'ol-contextmenu';
import type Map from 'ol/Map';

const items: Item[] = [
    {
        text: 'Center map here',
        callback: (obj, map: Map) => {
            map.getView().animate({
                center: obj.coordinate,
                duration: 700,
            });
        },
    },
    '-', // Separator (type-safe)
    {
        text: 'Zoom In',
        callback: (obj, map: Map) => {
            const view = map.getView();
            view.animate({
                zoom: view.getZoom()! + 1,
                duration: 500,
            });
        },
    },
];

const contextmenu = new ContextMenu({
    width: 170,
    defaultItems: true,
    items,
});
```

## Available Types

### `Item`

Union type representing any menu item:

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

A menu item containing nested subitems:

```typescript
interface ItemWithNested {
    text: string;
    items: Item[];
    icon?: string;
    classname?: string;
}
```

### `ItemSeparator`

Menu separator (literal type):

```typescript
type ItemSeparator = '-';
```

### `Options`

Constructor options:

```typescript
interface Options {
    width?: number;
    defaultItems?: boolean;
    items?: Item[];
    eventType?: EventTypes;
}
```

### `CallbackObject`

Data passed to callbacks:

```typescript
interface CallbackObject {
    coordinate: Coordinate;
    data?: any;
}
```

### `ContextMenuEvent`

Event data for `beforeopen` and `open` events:

```typescript
class ContextMenuEvent extends BaseEvent {
    map: Map;
    coordinate: Coordinate;
    pixel: Pixel;
    originalEvent: MouseEvent;
}
```

### `EventTypes`

Enum for event trigger types:

```typescript
enum EventTypes {
    CONTEXTMENU = 'contextmenu',
    CLICK = 'click',
    DBLCLICK = 'dblclick',
}
```

### `CustomEventTypes`

Enum for menu events:

```typescript
enum CustomEventTypes {
    BEFOREOPEN = 'beforeopen',
    OPEN = 'open',
    CLOSE = 'close',
}
```

## Type-Safe Patterns

### Typed Callback Functions

```typescript
import type { CallbackObject } from 'ol-contextmenu';
import type Map from 'ol/Map';

const handleCenter = (obj: CallbackObject, map: Map): void => {
    map.getView().setCenter(obj.coordinate);
};

const handleZoom = (obj: CallbackObject, map: Map): void => {
    const view = map.getView();
    const currentZoom = view.getZoom();

    if (currentZoom !== undefined) {
        view.setZoom(currentZoom + 1);
    }
};

const items: Item[] = [
    { text: 'Center', callback: handleCenter },
    { text: 'Zoom In', callback: handleZoom },
];
```

### Custom Data with Type Safety

```typescript
interface MarkerData {
    id: number;
    name: string;
    type: 'marker' | 'poi';
}

const markerItem: SingleItem = {
    text: 'Delete Marker',
    data: {
        id: 1,
        name: 'My Marker',
        type: 'marker',
    } as MarkerData,
    callback: (obj) => {
        const data = obj.data as MarkerData;
        console.log(`Deleting ${data.type}: ${data.name}`);
    },
};
```

### Event Handlers

```typescript
import { CustomEventTypes, type ContextMenuEvent } from 'ol-contextmenu';

contextmenu.on(CustomEventTypes.BEFOREOPEN, (evt: ContextMenuEvent) => {
    console.log('Clicked at:', evt.coordinate);
    console.log('Pixel:', evt.pixel);
    console.log('Map:', evt.map);
});

contextmenu.on(CustomEventTypes.OPEN, (evt: ContextMenuEvent) => {
    const feature = evt.map.forEachFeatureAtPixel(
        evt.pixel,
        (ft) => ft,
    );

    if (feature) {
        console.log('Clicked on feature:', feature.getId());
    }
});
```

### Nested Submenus

```typescript
const nestedItems: Item[] = [
    {
        text: 'Tools',
        items: [
            {
                text: 'Measure',
                items: [
                    {
                        text: 'Distance',
                        callback: measureDistance,
                    },
                    {
                        text: 'Area',
                        callback: measureArea,
                    },
                ],
            },
            '-',
            {
                text: 'Export',
                callback: exportMap,
            },
        ],
    },
];
```

## Complete TypeScript Example

```typescript
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import ContextMenu, {
    type Item,
    type CallbackObject,
    CustomEventTypes,
} from 'ol-contextmenu';

// Initialize map
const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
    ],
    view: new View({
        center: [0, 0],
        zoom: 2,
    }),
});

// Vector layer for markers
const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
    source: vectorSource,
});
map.addLayer(vectorLayer);

// Type-safe callback functions
const addMarker = (obj: CallbackObject, map: Map): void => {
    const marker = new Feature({
        geometry: new Point(obj.coordinate),
    });
    vectorSource.addFeature(marker);
    console.log('Marker added at', obj.coordinate);
};

const centerMap = (obj: CallbackObject, map: Map): void => {
    map.getView().animate({
        center: obj.coordinate,
        duration: 700,
    });
};

// Define menu items
const items: Item[] = [
    {
        text: 'Add Marker',
        icon: './marker.png',
        callback: addMarker,
    },
    '-',
    {
        text: 'Center Here',
        callback: centerMap,
    },
];

// Create context menu
const contextmenu = new ContextMenu({
    width: 180,
    defaultItems: true,
    items,
});

// Add to map
map.addControl(contextmenu);

// Event handlers
contextmenu.on(CustomEventTypes.BEFOREOPEN, (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (ft) => ft);

    if (feature) {
        contextmenu.clear();
        contextmenu.push({
            text: 'Delete Marker',
            callback: () => {
                vectorSource.removeFeature(feature);
            },
        });
    } else {
        contextmenu.clear();
        contextmenu.extend(items);
        contextmenu.extend(contextmenu.getDefaultItems());
    }
});
```

## Strict Type Checking

Enable strict mode in `tsconfig.json` for maximum type safety:

```json
{
    "compilerOptions": {
        "strict": true,
        "strictNullChecks": true,
        "strictFunctionTypes": true,
        "noImplicitAny": true,
        "noImplicitThis": true
    }
}
```

## Common Type Issues

### Issue: Cannot find module 'ol-contextmenu'

**Solution:** Make sure the package is installed:

```bash
npm install ol-contextmenu
```

### Issue: Type errors with `callback`

**Problem:**
```typescript
// ❌ Error: Type '() => void' is not assignable...
const item = {
    text: 'Test',
    callback: () => console.log('test'),
};
```

**Solution:**
```typescript
// ✅ Correct: Include parameters
const item: SingleItem = {
    text: 'Test',
    callback: (obj, map) => console.log('test'),
};
```

### Issue: Cannot import types

**Problem:**
```typescript
// ❌ Wrong
import { ContextMenu, Item } from 'ol-contextmenu';
```

**Solution:**
```typescript
// ✅ Correct
import ContextMenu, { type Item } from 'ol-contextmenu';
```

## See Also

- [API Reference](./api-reference.md)
- [Getting Started](./getting-started.md)
- [Examples & Recipes](./examples.md)
