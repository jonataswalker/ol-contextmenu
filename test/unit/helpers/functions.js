exports.callback1 = obj => {
  console.log(obj);
};

exports.callback2 = obj => {
  console.log(obj);
};

exports.toJSON = obj => JSON.stringify(obj);

exports.countItems = obj => Object.keys(obj).length;
