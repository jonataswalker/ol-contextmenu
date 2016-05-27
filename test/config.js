var require = patchRequire(require),
    vars = require('../config/vars.json'),
    port = 8888;

exports.vars = vars;

exports.port = port;

exports.url = 'http://127.0.0.1:' + port + '/test/contextmenu.html';

exports.elements = {
  container: 'ul.' + vars.namespace + vars.container_class
};