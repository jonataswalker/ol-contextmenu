# OpenLayers 3 Custom Context Menu
A `contextmenu` extension for OpenLayers 3.

## Demo
You can see [here a demo](http://rawgit.com/jonataswalker/ol3-contextmenu/master/examples/contextmenu.html).

## How to use it?
Load the CSS and Javascript:
```HTML
<link rel="stylesheet" href="ol3-contextmenu.css" />
<script src="ol3-contextmenu.js"></script>
```

Instantiate with some options and add the Control
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