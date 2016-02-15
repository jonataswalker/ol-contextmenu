# OpenLayers 3 Custom Context Menu
A `contextmenu` extension for OpenLayers 3.

![contextmenu anim](https://raw.githubusercontent.com/jonataswalker/ol3-contextmenu/screenshot/images/anim.gif)

## Demo
You can see [here a demo](http://rawgit.com/jonataswalker/ol3-contextmenu/master/examples/contextmenu.html) or [JSFiddle](http://jsfiddle.net/jonataswalker/ooxs1w5d/).

## How to use it?
##### CDN Hosted - [jsDelivr](http://www.jsdelivr.com/projects/openlayers.contextmenu)
Load CSS and Javascript:
```HTML
<link href="//cdn.jsdelivr.net/openlayers.contextmenu/latest/ol3-contextmenu.min.css"  rel="stylesheet">
<script src="//cdn.jsdelivr.net/openlayers.contextmenu/latest/ol3-contextmenu.js"></script>
```
##### Self hosted
Download [latest release](https://github.com/jonataswalker/ol3-contextmenu/releases/latest) and (obviously) load CSS and Javascript.

##### Instantiate with some options and add the Control
```javascript
var contextmenu = new ContextMenu({
  width: 170,
  default_items: true, //default_items are (for now) Zoom In/Zoom Out
  items: [
    {
      text: 'Center map here',
      callback: center //center is your callback function
    },
    {
      text: 'Add a Marker',
      icon: 'img/marker.png',  //this can be relative or absolute
      callback: marker
    },
    '-' //this is a separator
  ]
});
map.addControl(contextmenu);
```

##### Would you like to propagate custom data to the callback handler?
```javascript
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
  if (feature) {
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
```

# API

## Constructor

#### `new ContextMenu(options)`

###### `options` is an object with the following possible properties:
* `default_items`: *true*; Whether the default items (which are: Zoom In/Out) are enabled
* `width`: *150*; The menu's width
* `items`: *[]*; An array of object|string

## Methods

#### contextmenu.clear()

Remove all elements from the menu.

#### contextmenu.extend(arr)

@param {Array} arr Array.

Add items to the menu. This pushes each item in the provided array to the end of the menu.

Example:
```js
var contextmenu = new ContextMenu();
map.addControl(contextmenu);

var add_later = [
  '-', // this is a separator
  {
    text: 'Add a Marker',
    icon: 'img/marker.png',
    callback: marker
  }
];
contextmenu.extend(add_later);
```

#### contextmenu.push(item)

@param {Object|String} item Item.

Insert the provided item at the end of the menu.

#### contextmenu.pop(item)

Remove the last item of the menu.

#### contextmenu.getDefaultItems()

Get an array of default items.


## Events

#### Listen and make some changes before context menu opens

```javascript
contextmenu.on('open', function(evt){
  var feature = map.forEachFeatureAtPixel(evt.pixel, function(ft, l){
    return ft;
  });
  if (feature) {
    // add some other items to the menu
  }
});
```

#### Any action when context menu gets closed?

```javascript
contextmenu.on('close', function(evt){
  // it's upon you
});
```