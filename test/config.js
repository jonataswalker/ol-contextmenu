var require = patchRequire(require);
var vars = require('../config/vars.json');

exports.elements = {
  container: 'ul.' + vars.namespace
};

var center = function(obj){
  var pan = ol.animation.pan({
    duration: 100,
    source: map.getView().getCenter()
  });
  map.beforeRender(pan);
  map.getView().setCenter(obj.coordinate);
};

var contextmenu_items = [
  {
    text: 'Center map here',
    callback: center
  },
  '-'
];

exports.contextmenu_opts = {
  width: 180,
  default_items: true,
  items: contextmenu_items
};

var port = 8888;
exports.port = port;
exports.url = 'http://127.0.0.1:' + port + '/test/contextmenu.html';
