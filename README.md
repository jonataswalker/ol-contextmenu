# OpenLayers 3 Custom Context Menu
A `contextmenu` extension for OpenLayers 3.

![contextmenu anim](https://raw.githubusercontent.com/jonataswalker/ol3-contextmenu/screenshots/images/anim.gif)

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