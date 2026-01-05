# Getting Started with ol-contextmenu

This guide will help you get up and running with `ol-contextmenu` in your OpenLayers project.

## Prerequisites

- **OpenLayers**: Version 7.0.0 or higher
- **Modern Browser**: Chrome, Firefox, Safari, or Edge with ES6 support
- **Build Tool** (optional): Webpack, Vite, Rollup, or similar

## Installation

### npm (Recommended)

```bash
npm install ol-contextmenu
```

If you don't have OpenLayers installed:

```bash
npm install ol ol-contextmenu
```

### CDN

For quick prototyping or simple projects:

#### jsDelivr

```html
<script src="https://cdn.jsdelivr.net/npm/ol@latest/dist/ol.js"></script>
<script src="https://cdn.jsdelivr.net/npm/ol-contextmenu"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@latest/ol.css">
```

#### UNPKG

```html
<script src="https://unpkg.com/ol@latest/dist/ol.js"></script>
<script src="https://unpkg.com/ol-contextmenu"></script>
<link rel="stylesheet" href="https://unpkg.com/ol@latest/ol.css">
```

## Basic Setup

### 1. Import the Library

**ES6 Modules:**

```javascript
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import ContextMenu from 'ol-contextmenu';
```

**CommonJS:**

```javascript
const ContextMenu = require('ol-contextmenu');
```

**CDN (Global):**

```javascript
// Available as global: ContextMenu
const contextmenu = new ContextMenu();
```

### 2. Create Your Map

```javascript
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
```

### 3. Initialize Context Menu

```javascript
const contextmenu = new ContextMenu({
    width: 170,
    defaultItems: true,
    items: [
        {
            text: 'Center map here',
            callback: (obj) => {
                map.getView().animate({
                    center: obj.coordinate,
                    duration: 700,
                });
            },
        },
        '-', // Separator
        {
            text: 'Some Action',
            callback: () => {
                alert('Action clicked!');
            },
        },
    ],
});
```

### 4. Add to Map

```javascript
map.addControl(contextmenu);
```

## Complete Example

Here's a complete working example:

```html
<!DOCTYPE html>
<html>
<head>
    <title>ol-contextmenu Example</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@latest/ol.css">
    <style>
        #map {
            width: 100%;
            height: 600px;
        }
    </style>
</head>
<body>
    <div id="map"></div>

    <script src="https://cdn.jsdelivr.net/npm/ol@latest/dist/ol.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/ol-contextmenu"></script>
    <script>
        const map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: [0, 0],
                zoom: 2
            })
        });

        const contextmenu = new ContextMenu({
            width: 170,
            items: [
                {
                    text: 'Center map here',
                    callback: function(obj) {
                        map.getView().animate({
                            center: obj.coordinate,
                            duration: 700
                        });
                    }
                }
            ]
        });

        map.addControl(contextmenu);
    </script>
</body>
</html>
```

## Next Steps

- **[API Reference](./api-reference.md)** - Learn about all available methods and options
- **[Examples & Recipes](./examples.md)** - See common patterns and use cases
- **[TypeScript Guide](./typescript.md)** - Add type safety to your project

## Common Patterns

### Adding Icons to Menu Items

```javascript
{
    text: 'Add Marker',
    icon: 'path/to/icon.png', // URL or data URI
    callback: addMarker,
}
```

### Creating Submenus

```javascript
{
    text: 'Actions',
    items: [
        {
            text: 'Action 1',
            callback: action1,
        },
        {
            text: 'Action 2',
            callback: action2,
        },
    ],
}
```

### Using Separators

```javascript
const items = [
    { text: 'Item 1', callback: fn1 },
    '-', // Separator
    { text: 'Item 2', callback: fn2 },
];
```

## Troubleshooting

**Menu doesn't appear:** Make sure you've added the control to the map with `map.addControl(contextmenu)`.

**Styles look wrong:** The CSS is bundled automatically since v6.0. No need to import separately.

**TypeScript errors:** Make sure you're using the correct import syntax (see [TypeScript Guide](./typescript.md)).

For more help, check the [Troubleshooting Guide](./troubleshooting.md).
