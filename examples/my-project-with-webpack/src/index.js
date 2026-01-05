// ============================================================================
// ES6 MODULE IMPORTS
// ============================================================================
// Import OpenLayers components using ES6 module syntax.
// Webpack will bundle these imports into a single file.

import OSM from 'ol/source/OSM'
import Fill from 'ol/style/Fill'
import Point from 'ol/geom/Point'
import { transform } from 'ol/proj'
import Stroke from 'ol/style/Stroke'
import TileLayer from 'ol/layer/Tile'
import { format } from 'ol/coordinate'
import ContextMenu from 'ol-contextmenu'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Icon, Text, Style } from 'ol/style'
import { View, Feature, Map as OlMap } from 'ol'

// Note: CSS is now bundled into the JavaScript, no separate CSS import needed

// Import custom styles
import './style.css'

// ============================================================================
// MAP SETUP
// ============================================================================

const view = new View({ center: [0, 0], zoom: 4 })
const vectorLayer = new VectorLayer({ source: new VectorSource() })
const baseLayer = new TileLayer({ source: new OSM() })

const map = new OlMap({
    layers: [baseLayer, vectorLayer],
    target: 'map',
    view,
})

// ============================================================================
// ICON URLS
// ============================================================================
// Using CDN-hosted icons for convenience.
// In production, you'd typically use local icon files.

const pinIcon
    = 'https://cdn.jsdelivr.net/gh/jonataswalker/ol-contextmenu@604befc46d737d814505b5d90fc171932f747043/examples/img/pin_drop.png'
const centerIcon
    = 'https://cdn.jsdelivr.net/gh/jonataswalker/ol-contextmenu@604befc46d737d814505b5d90fc171932f747043/examples/img/center.png'
const listIcon
    = 'https://cdn.jsdelivr.net/gh/jonataswalker/ol-contextmenu@604befc46d737d814505b5d90fc171932f747043/examples/img/view_list.png'

// ============================================================================
// MULTI-LEVEL NESTED SUBMENUS
// ============================================================================
// This example demonstrates creating submenus with multiple levels of nesting.
// You can nest submenus as deeply as needed.

// Third level: Individual items in a submenu
const actionsSubmenuItems = [
    {
        callback: marker,
        icon: pinIcon,
        text: 'Add a Marker',
    },
]

// Second level: A submenu containing the third level items
const actionsSubmenu = {
    icon: listIcon,
    items: actionsSubmenuItems,
    text: 'Some more Actions',
}

// Second level: Items that will be in the first level submenu
const actionsItems = [
    {
        callback: marker,
        icon: pinIcon,
        text: 'Add a Marker',
    },
    {
        callback: center,
        icon: centerIcon,
        text: 'Center map here',
    },
]

// First level: A submenu that contains both another submenu and regular items
// This shows how you can mix submenus and regular items at the same level
const firstLevelSubmenu = {
    icon: listIcon,
    items: [actionsSubmenu, ...actionsItems], // Spread operator to include items
    text: 'Some Actions',
}

// ============================================================================
// MENU ITEMS CONFIGURATION
// ============================================================================

const items = [
    {
        callback: center,
        classname: 'bold', // Custom CSS class for styling
        icon: centerIcon,
        text: 'Center map here',
    },
    {
        callback: marker,
        icon: pinIcon,
        text: 'Add a Marker',
    },
    '-', // Separator line
    {
        // Simple submenu example
        items: [
            {
                callback: marker,
                icon: pinIcon,
                text: 'Add a Marker',
            },
        ],
        text: 'Some more Actions, loooong',
    },
    '-', // Another separator
]

// Add the multi-level submenu to the items array
items.push(firstLevelSubmenu)

// ============================================================================
// CONTEXT MENU INSTANTIATION
// ============================================================================
// Create the context menu with configuration options:
//   - defaultItems: true - Includes built-in Zoom In/Out items
//   - items: Array of custom menu items
//   - width: Menu width in pixels

const contextmenu = new ContextMenu({
    defaultItems: true, // Enable default Zoom In/Out items
    items,
    width: 200,
})

// Add the context menu control to the map
map.addControl(contextmenu)

console.log({ contextmenu })

// ============================================================================
// EVENT HANDLING
// ============================================================================

// The 'beforeopen' event fires before the menu opens.
// Use this to conditionally enable/disable the menu or perform checks.
// The event object contains: coordinate, pixel, and originalEvent
contextmenu.on('beforeopen', (evt) => {
    console.log({ evt })
    // Example: You could check conditions here and call
    // contextmenu.enable() or contextmenu.disable()
})

// Example: Check if menu is open when map moves
map.on('moveend', () => {
    console.log('moveend', contextmenu.isOpen())
})

// ============================================================================
// CALLBACK FUNCTIONS
// ============================================================================
// Callback functions receive an object with:
//   - coordinate: [x, y] in map projection (EPSG:3857)
//   - pixel: [x, y] in screen pixels
//   - data: Custom data (if attached to menu item)

// Easing function for smooth animations
function elastic(t) {
    return 2 ** (-10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1
}

// Center the map at the clicked location
function center(obj) {
    view.animate({
        center: obj.coordinate,
        duration: 700,
        easing: elastic,
    })
}

// Add a marker at the clicked location
function marker(obj) {
    // Transform coordinates for display
    const coord4326 = transform(obj.coordinate, 'EPSG:3857', 'EPSG:4326')
    const template = 'Coordinate is ({x} | {y})'
    
    // Create styled marker with icon and text label
    const iconStyle = new Style({
        image: new Icon({ scale: 0.6, src: pinIcon }),
        text: new Text({
            fill: new Fill({ color: '#111' }),
            font: '15px Open Sans,sans-serif',
            offsetY: 25,
            stroke: new Stroke({ color: '#eee', width: 2 }),
            text: format(coord4326, template, 2),
        }),
    })
    
    // Create feature and add to vector layer
    const feature = new Feature({
        geometry: new Point(obj.coordinate),
        type: 'removable',
    })

    feature.setStyle(iconStyle)
    vectorLayer.getSource()?.addFeature(feature)
}
