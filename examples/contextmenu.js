(function(win, doc){
    'use strict';
    
    var 
        iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                scale: .8,
                src: 'img/marker.png'
            }),
            text: new ol.style.Text({
                font: '13px Calibri,sans-serif',
                fill: new ol.style.Fill({ color: '#111' }),
                stroke: new ol.style.Stroke({
                    color: '#eee', width: 2
                }),
                offsetY: 35
            })
        }),
        view = new ol.View({
            center: [0, 0],
            zoom: 3,
            minZoom: 2,
            maxZoom: 20
        }),
        vectorSource = new ol.source.Vector(),
        vectorLayer = new ol.layer.Vector({
            source: vectorSource
        }),
        baseLayer = new ol.layer.Tile({
            preload: Infinity,
            opacity: 1,
            source: new ol.source.MapQuest({layer: 'osm'})
        }),
        map = new ol.Map({
            target: doc.getElementById('map'),
            loadTilesWhileAnimating: true,
            view: view,
            layers: [baseLayer, vectorLayer]
        }),
        // from https://github.com/DmitryBaranovskiy/raphael
        elastic = function(t) {
            return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
        },
        center = function(obj){
            var pan = ol.animation.pan({
                duration: 1000,
                easing: elastic,
                source: view.getCenter()
            });
            map.beforeRender(pan);
            view.setCenter(obj.coordinate);
        },
        marker = function(obj){
            var
                feature = new ol.Feature(
                    new ol.geom.Point(obj.coordinate)
                ),
                template = 'Coordinate is ({x} | {y})',
                out = ol.coordinate.format(obj.coordinate, template, 2)
            ;
            
            iconStyle.getText().setText(out);
            feature.setStyle(iconStyle);
            vectorSource.addFeature(feature);
        }
    ;
    var contextmenu = new ContextMenu({
        width: 170,
        default_items: true,
        items: [
            {
                text: 'Center map here',
                callback: center
            },
            {
                text: 'Add a Marker',
                icon: 'img/marker.png',
                callback: marker
            },
            '-' // this is a separator
        ]
    });
    map.addControl(contextmenu);

})(window, document);