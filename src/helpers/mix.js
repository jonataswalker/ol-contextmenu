/**
 * Overwrites obj1's values with obj2's and adds
 * obj2's if non existent in obj1
 * @returns obj3 a new object based on obj1 and obj2
 */
export function mergeOptions(obj1, obj2) {
  let obj3 = {};
  for (let attr1 in obj1) obj3[attr1] = obj1[attr1];
  for (let attr2 in obj2) obj3[attr2] = obj2[attr2];
  return obj3;
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    if (typeof Error !== 'undefined') throw new Error(message);
    throw message; // Fallback
  }
}

/**
 * Does str contain test?
 * @param {String} str_test
 * @param {String} str
 * @returns Boolean
 */
export function contains(str_test, str) {
  return !!~str.indexOf(str_test);
}

export function getUniqueId() {
  return (
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
}

export function isDefAndNotNull(val) {
  // Note that undefined == null.
  return val != null; // eslint-disable-line no-eq-null
}

export function assertEqual(a, b, message) {
  if (a !== b) {
    throw new Error(message + ' mismatch: ' + a + ' != ' + b);
  }
}

export function now() {
  // Polyfill for window.performance.now()
  // @license http://opensource.org/licenses/MIT
  // copyright Paul Irish 2015
  // https://gist.github.com/paulirish/5438650
  if ('performance' in window === false) {
    window.performance = {};
  }

  Date.now =
    Date.now ||
    function () {
      // thanks IE8
      return new Date().getTime();
    };

  if ('now' in window.performance === false) {
    let nowOffset = Date.now();

    if (performance.timing && performance.timing.navigationStart) {
      nowOffset = performance.timing.navigationStart;
    }

    window.performance.now = () => Date.now() - nowOffset;
  }

  return window.performance.now();
}

export function randomId(prefix) {
  const id = now().toString(36);
  return prefix ? prefix + id : id;
}

export function isNumeric(str) {
  return /^\d+$/.test(str);
}

export function isEmpty(str) {
  return !str || 0 === str.length;
}

export function emptyArray(array) {
  while (array.length) array.pop();
}

export function anyMatchInArray(source, target) {
  return source.some(each => target.indexOf(each) >= 0);
}

export function everyMatchInArray(arr1, arr2) {
  return arr2.every(each => arr1.indexOf(each) >= 0);
}

export function anyItemHasValue(obj, has = false) {
  const keys = Object.keys(obj);
  keys.forEach(key => {
    if (!isEmpty(obj[key])) has = true;
  });
  return has;
}
