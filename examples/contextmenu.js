/* global ol, ContextMenu */
const view = new ol.View({ center: [0, 0], zoom: 4 });
const vectorLayer = new ol.layer.Vector({ source: new ol.source.Vector() });
const baseLayer = new ol.layer.Tile({ source: new ol.source.OSM() });
const map = new ol.Map({
    target: 'map',
    view,
    layers: [baseLayer, vectorLayer],
});

const contextmenu_items = [
    {
        text: 'Center map here',
        classname: 'bold',
        icon: 'img/center.png',
        callback: center,
    },
    {
        text: 'Some Actions',
        icon: 'img/view_list.png',
        items: [
            {
                text: 'Center map here',
                icon: 'img/center.png',
                callback: center,
            },
            {
                text: 'Add a Marker',
                icon: 'img/pin_drop.png',
                callback: marker,
            },
        ],
    },
    {
        text: 'Add a Marker',
        icon: 'img/pin_drop.png',
        callback: marker,
    },
    '-', // this is a separator
];

const removeMarkerItem = {
    text: 'Remove this Marker',
    classname: 'marker',
    callback: removeMarker,
};

const contextmenu = new ContextMenu({
    width: 180,
    items: contextmenu_items,
});

console.log({ contextmenu });

map.addControl(contextmenu);

contextmenu.on('open', (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (ft, l) => ft);

    if (feature && feature.get('type') === 'removable') {
        contextmenu.clear();
        removeMarkerItem.data = {
            marker: feature,
        };
        contextmenu.push(removeMarkerItem);
    } else {
        contextmenu.clear();
        contextmenu.extend(contextmenu_items);
        contextmenu.extend(contextmenu.getDefaultItems());
    }
});

map.on('pointermove', (e) => {
    const pixel = map.getEventPixel(e.originalEvent);
    const hit = map.hasFeatureAtPixel(pixel);

    if (e.dragging) return;

    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});

// from https://github.com/DmitryBaranovskiy/raphael
function elastic(t) {
    return 2 ** (-10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1;
}

function center(object) {
    view.animate({
        duration: 700,
        easing: elastic,
        center: object.coordinate,
    });
}

function removeMarker(object) {
    vectorLayer.getSource().removeFeature(object.data.marker);
}

function marker(object) {
    const coord4326 = ol.proj.transform(object.coordinate, 'EPSG:3857', 'EPSG:4326');
    const template = 'Coordinate is ({x} | {y})';
    const iconStyle = new ol.style.Style({
        image: new ol.style.Icon({ scale: 0.6, src: 'img/pin_drop.png' }),
        text: new ol.style.Text({
            offsetY: 25,
            text: ol.coordinate.format(coord4326, template, 2),
            font: '15px Open Sans,sans-serif',
            fill: new ol.style.Fill({ color: '#111' }),
            stroke: new ol.style.Stroke({ color: '#eee', width: 2 }),
        }),
    });
    const feature = new ol.Feature({
        type: 'removable',
        geometry: new ol.geom.Point(object.coordinate),
    });

    feature.setStyle(iconStyle);
    vectorLayer.getSource().addFeature(feature);
}
