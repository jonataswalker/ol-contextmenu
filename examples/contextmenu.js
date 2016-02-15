(function(win, doc){
  'use strict';
  
  var 
    view = new ol.View({
      center: [0, 0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 20
    }),
    vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector()
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
        coord4326 = ol.proj.transform(obj.coordinate, 'EPSG:3857', 'EPSG:4326'),
        template = 'Coordinate is ({x} | {y})',
        iconStyle = new ol.style.Style({
          image: new ol.style.Icon({
            scale: .6,
            src: 'img/marker.png'
          }),
          text: new ol.style.Text({
            offsetY: 25,
            text: ol.coordinate.format(coord4326, template, 2),
            font: '15px Open Sans,sans-serif',
            fill: new ol.style.Fill({ color: '#111' }),
            stroke: new ol.style.Stroke({
              color: '#eee', width: 2
            })
          })
        }),
        feature = new ol.Feature({
          type: 'removable',
          geometry: new ol.geom.Point(obj.coordinate)
        })
      ;
      
      feature.setStyle(iconStyle);
      vectorLayer.getSource().addFeature(feature);
    }
  ;
  var contextmenu_items = [
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
  ];
  var contextmenu = new ContextMenu({
    width: 190,
    default_items: true,
    items: contextmenu_items
  });
  map.addControl(contextmenu);
  
  var removeMarker = function(obj){
    vectorLayer.getSource().removeFeature(obj.data.marker);
  };
  var removeMarkerItem = {
    text: 'Remove this Marker',
    icon: 'img/marker.png',
    callback: removeMarker
  };
  
  contextmenu.on('open', function(evt){
    var feature = map.forEachFeatureAtPixel(evt.pixel, function(ft, l){
      return ft;
    });
    if (feature && feature.get('type') == 'removable') {
      contextmenu.clear();
      removeMarkerItem.data = {
        marker: feature
      };
      contextmenu.push(removeMarkerItem);
      
    } else {
      contextmenu.clear();
      contextmenu.extend(contextmenu_items);
      contextmenu.extend(contextmenu.getDefaultItems());
    }
  });
  map.on('pointermove', function(e) {
    if (e.dragging) return;
         
    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    
    map.getTarget().style.cursor = hit ? 'pointer' : '';
  });

})(window, document);