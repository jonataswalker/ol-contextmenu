# Examples & Recipes

Common patterns and code examples for `ol-contextmenu`.

## Table of Contents

- [Basic Examples](#basic-examples)
- [Dynamic Menus](#dynamic-menus)
- [Feature Detection](#feature-detection)
- [Custom Styling](#custom-styling)
- [Advanced Patterns](#advanced-patterns)

## Basic Examples

### Simple Menu

```javascript
import ContextMenu from 'ol-contextmenu';

const contextmenu = new ContextMenu({
    width: 170,
    items: [
        {
            text: 'Center map here',
            callback: (obj, map) => {
                map.getView().animate({
                    center: obj.coordinate,
                    duration: 700,
                });
            },
        },
    ],
});

map.addControl(contextmenu);
```

### Menu with Separators

```javascript
const items = [
    { text: 'Zoom In', callback: zoomIn },
    { text: 'Zoom Out', callback: zoomOut },
    '-', // Separator
    { text: 'Center Map', callback: center },
    '-',
    { text: 'Export View', callback: exportView },
];

const contextmenu = new ContextMenu({ items });
```

### Menu with Icons

```javascript
const items = [
    {
        text: 'Add Marker',
        icon: 'data:image/svg+xml;base64,...', // SVG data URI
        callback: addMarker,
    },
    {
        text: 'Delete',
        icon: './icons/trash.png', // Relative path
        callback: deleteFeature,
    },
];
```

### Multi-Level Submenus

```javascript
const items = [
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
    {
        text: 'Export',
        items: [
            {
                text: 'PNG',
                callback: exportPNG,
            },
            {
                text: 'JPEG',
                callback: exportJPEG,
            },
            {
                text: 'PDF',
                callback: exportPDF,
            },
        ],
    },
];
```

## Dynamic Menus

### Context-Aware Menu

Change menu items based on what's clicked:

```javascript
let currentFeature = null;

contextmenu.on('beforeopen', (evt) => {
    currentFeature = map.forEachFeatureAtPixel(evt.pixel, (ft) => ft);

    contextmenu.clear();

    if (currentFeature) {
        // Menu for features
        contextmenu.extend([
            {
                text: 'Delete Feature',
                callback: () => vectorSource.removeFeature(currentFeature),
            },
            {
                text: 'Edit Properties',
                callback: () => editProperties(currentFeature),
            },
            '-',
            {
                text: 'Zoom to Feature',
                callback: () => {
                    const extent = currentFeature.getGeometry().getExtent();
                    map.getView().fit(extent, { duration: 700 });
                },
            },
        ]);
    } else {
        // Menu for empty map
        contextmenu.extend([
            {
                text: 'Add Marker',
                callback: (obj) => addMarkerAt(obj.coordinate),
            },
            {
                text: 'Center Here',
                callback: (obj) => {
                    map.getView().animate({
                        center: obj.coordinate,
                        duration: 700,
                    });
                },
            },
        ]);
    }
});
```

### Conditional Menu Items

```javascript
contextmenu.on('beforeopen', (evt) => {
    const view = map.getView();
    const zoom = view.getZoom();
    const maxZoom = view.getMaxZoom();

    // Prevent menu from opening at max zoom
    if (zoom >= maxZoom) {
        contextmenu.disable();
    } else {
        contextmenu.enable();
    }
});

contextmenu.on('open', (evt) => {
    const view = map.getView();
    const zoom = view.getZoom();

    // Add contextual items based on zoom level
    if (zoom < 10) {
        contextmenu.push({
            text: 'Switch to Satellite',
            callback: () => switchLayer('satellite'),
        });
    }
});
```

## Feature Detection

### Detect Feature Type

```javascript
contextmenu.on('beforeopen', (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (ft) => ft);

    if (feature) {
        const geomType = feature.getGeometry().getType();

        contextmenu.clear();

        switch (geomType) {
            case 'Point':
                contextmenu.extend([
                    { text: 'Move Marker', callback: moveMarker },
                    { text: 'Delete Marker', callback: deleteMarker },
                ]);
                break;

            case 'LineString':
                contextmenu.extend([
                    { text: 'Measure Length', callback: measureLength },
                    { text: 'Delete Line', callback: deleteLine },
                ]);
                break;

            case 'Polygon':
                contextmenu.extend([
                    { text: 'Measure Area', callback: measureArea },
                    { text: 'Delete Polygon', callback: deletePolygon },
                ]);
                break;
        }
    }
});
```

### Multiple Feature Layers

```javascript
contextmenu.on('beforeopen', (evt) => {
    const features = [];

    map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        features.push({ feature, layer });
    });

    contextmenu.clear();

    if (features.length === 0) {
        contextmenu.extend(defaultItems);
    } else if (features.length === 1) {
        contextmenu.extend(getSingleFeatureItems(features[0]));
    } else {
        // Multiple features - show selection submenu
        contextmenu.push({
            text: `${features.length} features`,
            items: features.map((f, i) => ({
                text: `Feature ${i + 1}`,
                callback: () => selectFeature(f.feature),
            })),
        });
    }
});
```

## Custom Styling

### Custom CSS Classes

```javascript
const items = [
    {
        text: 'Danger Action',
        classname: 'danger-item',
        callback: dangerAction,
    },
    {
        text: 'Success Action',
        classname: 'success-item',
        callback: successAction,
    },
];
```

```css
.danger-item {
    color: #dc3545;
    font-weight: bold;
}

.success-item {
    color: #28a745;
}
```

### Font Awesome Icons

```javascript
const items = [
    {
        text: 'Delete',
        classname: 'fa fa-trash',
        callback: deleteItem,
    },
    {
        text: 'Edit',
        classname: 'fa fa-edit',
        callback: editItem,
    },
];
```

## Advanced Patterns

### Restore Previous Menu

```javascript
// Store menu items separately since there's no getItems() method
const defaultMenuItems = [
    { text: 'Add Marker', callback: addMarker },
    { text: 'Center Here', callback: centerMap },
];

const featureMenuItems = [
    { text: 'Delete Feature', callback: deleteFeature },
    { text: 'Edit Properties', callback: editProperties },
];

let isFeatureMenu = false;

contextmenu.on('beforeopen', (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (ft) => ft);

    if (feature && !isFeatureMenu) {
        // Switch to feature menu
        contextmenu.clear();
        contextmenu.extend(featureMenuItems);
        isFeatureMenu = true;
    } else if (!feature && isFeatureMenu) {
        // Restore default menu
        contextmenu.clear();
        contextmenu.extend(defaultMenuItems);
        isFeatureMenu = false;
    }
});
```

### Async Data Loading

```javascript
contextmenu.on('open', async (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (ft) => ft);

    if (feature) {
        const featureId = feature.getId();

        contextmenu.clear();
        contextmenu.push({ text: 'Loading...', callback: () => {} });

        try {
            const data = await fetch(`/api/features/${featureId}`).then(r => r.json());

            contextmenu.clear();
            contextmenu.extend([
                {
                    text: `Edit ${data.name}`,
                    callback: () => edit(data),
                },
                {
                    text: 'View Details',
                    callback: () => showDetails(data),
                },
            ]);
        } catch (error) {
            contextmenu.clear();
            contextmenu.push({
                text: 'Error loading data',
                callback: () => {},
            });
        }
    }
});
```

### Coordinate Formatting

```javascript
import { toLonLat } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';

const showCoordinates = (obj) => {
    const lonLat = toLonLat(obj.coordinate);
    const hdms = toStringHDMS(lonLat);

    alert(`
        Decimal: ${lonLat[1].toFixed(5)}, ${lonLat[0].toFixed(5)}
        DMS: ${hdms}
    `);
};

const items = [
    {
        text: 'Show Coordinates',
        callback: showCoordinates,
    },
];
```

### Integration with Drawing

```javascript
import Draw from 'ol/interaction/Draw';

let draw;
const source = new VectorSource();

contextmenu.on('open', (evt) => {
    const items = [
        {
            text: 'Start Drawing',
            items: [
                {
                    text: 'Point',
                    callback: () => startDrawing('Point'),
                },
                {
                    text: 'LineString',
                    callback: () => startDrawing('LineString'),
                },
                {
                    text: 'Polygon',
                    callback: () => startDrawing('Polygon'),
                },
            ],
        },
    ];

    if (draw) {
        items.push({
            text: 'Stop Drawing',
            callback: () => {
                map.removeInteraction(draw);
                draw = null;
            },
        });
    }

    contextmenu.clear();
    contextmenu.extend(items);
});

function startDrawing(type) {
    if (draw) {
        map.removeInteraction(draw);
    }

    draw = new Draw({
        source,
        type,
    });

    map.addInteraction(draw);
}
```

## See Also

- [API Reference](./api-reference.md)
- [TypeScript Guide](./typescript.md)
- [Getting Started](./getting-started.md)
- [Local Examples](../examples)
