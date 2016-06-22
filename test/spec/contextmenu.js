var ol          = require('openlayers');
var ContextMenu = require('../../build/ol3-contextmenu');

var contextmenu,
    elements = config.elements,
    vars = config.vars,
    map_id = 'map',
    ctx_options = {
      width: 180,
      default_items: true
    };

casper.options.viewportSize = {width: 1024, height: 768};
casper.options.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X)';
casper.options.pageSettings.loadImages = true;
casper.options.pageSettings.loadPlugins = true;
casper.options.pageSettings.webSecurityEnabled = false;
casper.options.pageSettings.localToRemoteUrlAccessEnabled = true;

casper.test.begin('Constructor asserts', 3, function (test) {
  contextmenu = new ContextMenu(ctx_options);
  
  test.assertInstanceOf(contextmenu, ol.control.Control, 
      'Ok, ContextMenu is ol.control.Control');

  test.assertEquals(contextmenu.options.width, ctx_options.width);
  test.assertEquals(contextmenu.options.default_items, ctx_options.default_items);
  
  test.done();
});

casper.test.begin('Assert DOM Elements', 3, function(test) {
  
  casper.start(config.url).waitFor(function() {
    return casper.evaluate(function() {
      return window.domready === true;
    });
  });
  
  casper.thenEvaluate(function(options, map_id) {
    var map = new ol.Map({
      target: map_id,
      layers: [],
      view: new ol.View({
        center: [0, 0],
        zoom: 1
      })
    });
    
    var contextmenu = new ContextMenu(options);
    map.addControl(contextmenu);
  }, ctx_options, map_id);
  
  casper.then(function() {
    this.mouse.rightclick('#' + map_id);
  });
  
  casper.waitUntilVisible(elements.container, function() {
    test.assertExists(elements.container);
    
    test.assertVisible(elements.container);
    
    test.assertElementCount(
      elements.container + '>li', contextmenu.getDefaultItems().length);
  });
  
  casper.run(function() {
    test.done();
  });
});

casper.test.begin('Assert API Methods', 1, function(test) {
  
  casper.start(config.url).waitFor(function() {
    return casper.evaluate(function() {
      return window.domready === true;
    });
  });
  
  casper.thenEvaluate(function(options, map_id) {
    var map = new ol.Map({
      target: map_id,
      layers: [],
      view: new ol.View({
        center: [0, 0],
        zoom: 1
      })
    });
    
    window.contextmenu = new ContextMenu(options);
    map.addControl(contextmenu);
  }, ctx_options, map_id);
  
  casper.then(function() {
    this.mouse.rightclick('#' + map_id);
  });
  
  casper.waitUntilVisible(elements.container, function() {
    casper.evaluate(function() {
      window.contextmenu.close();
    });
  });
  
  casper.then(function() {
    test.assertExists(
      elements.container +'.'+ vars.namespace + vars.hidden_class);
  });
  
  casper.run(function() {
    test.done();
  });
});
