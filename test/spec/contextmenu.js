casper.test.begin('assertInstanceOf() tests', 1, function (test) {
  test.assertInstanceOf(contextmenu, ol.control.Control, 
      'Ok, new Geocoder() is ol.control.Control');

  test.done();
});

casper.test.begin('Assert DOM Elements', 1, function(test) {
  casper.start(config.url, function() {
    this.viewport(1024, 768);
    
    test.assertExists(elements.container);
    
  }).run(function() {
    test.done();
  });
});