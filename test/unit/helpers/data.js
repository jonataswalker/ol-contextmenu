const { callback1, callback2 } = require('./functions');

const dataMarker = exports.dataMarker = 'data-marker';
const dataCenter = exports.dataCenter = 'data-center';

const items = exports.items = [
  '-',
  {
    text: 'Center map here',
    classname: 'bold',
    data: dataCenter,
    callback: callback1
  },
  {
    text: 'Add a Marker',
    data: dataMarker,
    callback: callback2
  },
];

exports.items2 = [
  {
    text: 'Foo',
    callback: callback1
  },
  {
    text: 'Bar',
    callback: callback2
  },
];

exports.options = {
  items,
  width: 300,
};
