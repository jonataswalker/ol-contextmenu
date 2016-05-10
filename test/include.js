var require = patchRequire(require);

// path here is relative to where this will be injected
var config      = require('../config');
var vars        = require('../../config/vars.json');
var ol          = require('openlayers');
var ContextMenu = require('../../build/ol3-contextmenu');
var server      = require('webserver').create();
var fs          = require('fs');

var elements = config.elements;
var contextmenu = new ContextMenu(config.contextmenu_opts);

var contentTypes = {
  css   : 'text/css',
  html  : 'text/html',
  js    : 'application/javascript',
  png   : 'image/png',
  gif   : 'image/gif',
  jpg   : 'image/jpeg',
  jpeg  : 'image/jpeg'
};

var ip_server = '127.0.0.1:' + config.port;
server.listen(ip_server, function(req, res) {
  var file_path = fs.workingDirectory + req.url;
  var ext = req.url.substring(req.url.indexOf('.') + 1);
  var file = '';
  
  res.statusCode = 200;
  res.headers = {
    'Cache': 'no-cache',
    'Content-Type': contentTypes[ext] || 'text/html'
  };
  if (fs.isReadable(file_path)) {
    file = fs.read(file_path);
  } else {
    res.statusCode = 404;
  }
  res.write(file);
  res.close();
});

// test suites completion listener
casper.test.on('tests.complete', function() {
  server.close();
});