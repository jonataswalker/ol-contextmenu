var ol = require('openlayers');
var ContextMenu = require('../../build/ol3-contextmenu');

var contextmenu,
    default_items,
    elements = config.elements,
    vars = config.vars,
    map_id = 'map',
    ctx_options = {
      width: 180,
      default_items: true
    };

casper.options.waitTimeout = 1000;
casper.options.viewportSize = {width: 1024, height: 768};
casper.options.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X)';
casper.options.pageSettings.loadImages = true;
casper.options.pageSettings.loadPlugins = true;
casper.options.pageSettings.webSecurityEnabled = false;
casper.options.pageSettings.localToRemoteUrlAccessEnabled = true;

casper.test.begin('Constructor asserts', 3, function (test) {
  contextmenu = new ContextMenu(ctx_options);
  default_items = contextmenu.getDefaultItems();
  
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
  
  rightClick();
  
  casper.waitUntilVisible(elements.container, function() {
    test.assert(true, 'Container is visible');
    test.assertExists(elements.container);
    test.assertElementCount(elements.container + '>li', default_items.length);
  });
  
  casper.run(function() {
    test.done();
  });
});

casper.test.begin('Assert API Methods', 8, function(test) {
  
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
  
  // close()
  rightClick();
  casper.waitUntilVisible(elements.container, function() {
    casper.evaluate(function() {
      window.contextmenu.close();
    });
  });
  casper.then(assertContainerHidden.bind(null, test, 'Ok, close() method'));

  // extend()
  closeAndRightClick();
  casper.thenEvaluate(function(items) {
    window.contextmenu.clear();
    window.contextmenu.extend(items);
  }, default_items);
  casper.then(function() {
    test.assertElementCount(
      elements.container + '>li', default_items.length, 'Ok, extend() method');
  });
  
  
  // clear()
  closeAndRightClick();
  casper.waitUntilVisible(elements.container, function() {
    casper.evaluate(function() {
      window.contextmenu.clear();
    });
  });
  casper.then(function() {
    test.assertElementCount(elements.container + '>li', 0, 'Ok, clear() method');
  });

  
  // enable() && disable()
  casper.thenEvaluate(function() {
    window.contextmenu.disable();
  });
  closeAndRightClick();
  casper.then(assertContainerHidden.bind(null, test, 'Ok, disable() method'));
  
  casper.thenEvaluate(function(items) {
    window.contextmenu.enable();
    window.contextmenu.clear();
    window.contextmenu.extend(items);
  }, default_items);
  rightClick();
  casper.waitUntilVisible(elements.container, function() {
    test.assert(true, 'Ok, enable() method');
  });
  
  // pop() && shift()
  casper.thenEvaluate(function(items) {
    window.contextmenu.clear();
    window.contextmenu.extend(items);
    window.contextmenu.pop();
  }, default_items);
  closeAndRightClick();
  casper.then(function() {
    test.assertElementCount(
      elements.container + '>li', default_items.length - 1, 'Ok, pop() method');
  });
  casper.thenEvaluate(function() {
    window.contextmenu.shift();
  });
  closeAndRightClick();
  casper.then(function() {
    test.assertElementCount(
      elements.container + '>li', default_items.length - 2, 'Ok, shift() method');
  });

  // push()
  casper.thenEvaluate(function(items) {
    window.contextmenu.clear();
    window.contextmenu.extend(items);
    window.contextmenu.push('-');
  }, default_items);
  closeAndRightClick();
  casper.then(function() {
    test.assertElementCount(
      elements.container + '>li', default_items.length + 1, 'Ok, push() method');
  });
  
  casper.run(function() {
    test.done();
  });
});


function assertContainerHidden(test, msg) {
  if (msg) {
    test.assertExists(
      elements.container +'.'+ vars.namespace + vars.hidden_class, msg);
  } else {
    test.assertExists(elements.container +'.'+ vars.namespace + vars.hidden_class);
  }
}

function closeAndRightClick() {
  casper.thenEvaluate(function() {
    window.contextmenu.close();
  });
  rightClick();
}

function rightClick() {
  casper.then(function() {
    this.mouse.rightclick('#' + map_id);
  });
}