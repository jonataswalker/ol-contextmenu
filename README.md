# OpenLayers 3 Custom Context Menu

[![Build Status](https://travis-ci.org/jonataswalker/ol3-contextmenu.svg?branch=master)](https://travis-ci.org/jonataswalker/ol3-contextmenu)

A `contextmenu` extension for [OpenLayers 3](http://openlayers.org/). **Requires** OpenLayers **v3.11.0** or higher.

![contextmenu anim](https://raw.githubusercontent.com/jonataswalker/ol3-contextmenu/screenshot/images/anim.gif)

## Demo
You can see [here a demo](http://rawgit.com/jonataswalker/ol3-contextmenu/master/examples/contextmenu.html) or [JSFiddle](http://jsfiddle.net/jonataswalker/ooxs1w5d/).

## How to use it?
##### CDN Hosted - [jsDelivr](http://www.jsdelivr.com/projects/openlayers.contextmenu)
Load CSS and Javascript:
```HTML
<link href="//cdn.jsdelivr.net/openlayers.contextmenu/latest/ol3-contextmenu.min.css" rel="stylesheet">
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

##### You can add a (nested) submenu like this:

If you provide `items {Array}` a submenu will be created as a child of the current item. 

```javascript
var all_items = [
  {
    text: 'Some Actions',
    items: [ // <---- this is a submenu
      {
        text: 'Action 1',
        callback: action
      },
      {
        text: 'Other action',
        callback: action2
      }
    ]
  },
  {
    text: 'Add a Marker',
    icon: 'img/marker.png',
    callback: marker
  },
  '-' // this is a separator
];
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

var restore = false;
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
    restore = true;
  } else if (restore) {
    contextmenu.clear();
    contextmenu.extend(contextmenu_items);
    contextmenu.extend(contextmenu.getDefaultItems());
    restore = false;
  }
});
```

# API

## Constructor

#### `new ContextMenu(options)`

###### `options` is an object with the following possible properties:
* `default_items`: `true`; Whether the default items (which are: Zoom In/Out) are enabled
* `width`: `150`; The menu's width
* `items`: `[]`; An array of object|string

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