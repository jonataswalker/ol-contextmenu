/* global ol, ContextMenu */

// ============================================================================
// MAP SETUP
// ============================================================================
// Create a basic OpenLayers map with a base layer (OSM tiles) and a vector
// layer for adding markers dynamically.

const view = new ol.View({ center: [0, 0], zoom: 4 })
const vectorLayer = new ol.layer.Vector({ source: new ol.source.Vector() })
const baseLayer = new ol.layer.Tile({ source: new ol.source.OSM() })
const map = new ol.Map({
    layers: [baseLayer, vectorLayer],
    target: 'map',
    view,
})

// ============================================================================
// CONTEXT MENU ITEMS CONFIGURATION
// ============================================================================
// Define the menu items that will appear in the context menu.
// Each item can have:
//   - text: The label displayed in the menu
//   - icon: Path to an image file (relative or absolute URL)
//   - callback: Function to execute when the item is clicked
//   - classname: CSS class to apply for custom styling
//   - items: Array of items to create a submenu

const contextmenu_items = [
    // Basic menu item with icon and custom CSS class
    {
        callback: center,
        classname: 'bold', // Apply custom styling (see contextmenu.css)
        icon: 'img/center.png',
        text: 'Center map here',
    },
    // Submenu example: This item has nested items that appear in a submenu
    {
        icon: 'img/view_list.png',
        items: [
            {
                callback: center,
                icon: 'img/center.png',
                text: 'Center map here',
            },
            {
                callback: marker,
                icon: 'img/pin_drop.png',
                text: 'Add a Marker',
            },
        ],
        text: 'Some Actions',
    },
    // Another basic menu item
    {
        callback: marker,
        icon: 'img/pin_drop.png',
        text: 'Add a Marker',
    },
    '-', // Separator: Use '-' string to add a visual separator line
]

// ============================================================================
// DYNAMIC MENU ITEM
// ============================================================================
// This item will be added dynamically when right-clicking on a marker.
// The 'data' property will be set at runtime to pass the clicked feature
// to the callback function.

const removeMarkerItem = {
    callback: removeMarker,
    classname: 'marker', // Custom CSS class for styling
    text: 'Remove this Marker',
}

// ============================================================================
// CONTEXT MENU INSTANTIATION
// ============================================================================
// Create the context menu control with initial items and configuration.
// Options:
//   - items: Array of menu items (can be modified later)
//   - width: Width of the menu in pixels

const contextmenu = new ContextMenu({
    items: contextmenu_items,
    width: 180,
})

console.log({ contextmenu })

// Add the context menu as a control to the map
map.addControl(contextmenu)

// ============================================================================
// DYNAMIC MENU UPDATES
// ============================================================================
// The 'open' event fires when the context menu is about to open.
// This is the perfect place to dynamically change menu items based on context,
// such as whether the user clicked on a feature or empty space.

contextmenu.on('open', (evt) => {
    // Check if there's a feature at the clicked pixel location
    // forEachFeatureAtPixel returns the first feature found, or undefined
    const feature = map.forEachFeatureAtPixel(evt.pixel, (ft, l) => ft)

    if (feature && feature.get('type') === 'removable') {
        // User clicked on a removable marker
        // Clear all items and show only the remove option
        contextmenu.clear()
        // Attach the feature to the menu item's data property
        // This data will be passed to the callback function
        removeMarkerItem.data = {
            marker: feature,
        }
        contextmenu.push(removeMarkerItem)
    }
    else {
        // User clicked on empty space
        // Restore the default menu items
        contextmenu.clear()
        contextmenu.extend(contextmenu_items)
        // Add default items (Zoom In/Out) if needed
        contextmenu.extend(contextmenu.getDefaultItems())
    }
})

// ============================================================================
// CURSOR STYLING
// ============================================================================
// Change cursor to pointer when hovering over features to indicate
// they are interactive.

map.on('pointermove', (e) => {
    const pixel = map.getEventPixel(e.originalEvent)
    const hit = map.hasFeatureAtPixel(pixel)

    if (e.dragging) return

    map.getTargetElement().style.cursor = hit ? 'pointer' : ''
})

// ============================================================================
// CALLBACK FUNCTIONS
// ============================================================================
// These functions are called when menu items are clicked.
// Each callback receives an object with:
//   - coordinate: [x, y] array in map projection (EPSG:3857)
//   - data: Custom data attached to the menu item (if set)
//   pixel: [x, y] array of the click position in pixels

// Easing function for smooth animations
// from https://github.com/DmitryBaranovskiy/raphael
function elastic(t) {
    return 2 ** (-10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1
}

// Center the map at the clicked location with animation
function center(object) {
    view.animate({
        center: object.coordinate,
        duration: 700,
        easing: elastic,
    })
}

// Remove a marker feature from the map
// The feature is passed via object.data (set in the 'open' event handler)
function removeMarker(object) {
    vectorLayer.getSource().removeFeature(object.data.marker)
}

// Add a new marker at the clicked location
function marker(object) {
    // Transform coordinates from Web Mercator (EPSG:3857) to WGS84 (EPSG:4326)
    // for display purposes
    const coord4326 = ol.proj.transform(object.coordinate, 'EPSG:3857', 'EPSG:4326')
    const template = 'Coordinate is ({x} | {y})'
    
    // Create a style for the marker with icon and text label
    const iconStyle = new ol.style.Style({
        image: new ol.style.Icon({ scale: 0.6, src: 'img/pin_drop.png' }),
        text: new ol.style.Text({
            fill: new ol.style.Fill({ color: '#111' }),
            font: '15px Open Sans,sans-serif',
            offsetY: 25,
            stroke: new ol.style.Stroke({ color: '#eee', width: 2 }),
            text: ol.coordinate.format(coord4326, template, 2),
        }),
    })
    
    // Create a new feature at the clicked location
    const feature = new ol.Feature({
        geometry: new ol.geom.Point(object.coordinate),
        type: 'removable', // Custom property to identify removable markers
    })

    feature.setStyle(iconStyle)
    vectorLayer.getSource().addFeature(feature)
}
