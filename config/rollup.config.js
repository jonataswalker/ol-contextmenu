import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';

var pkg = require('../package.json');

export default {
  format: 'umd',
    entry: pkg.rollup.entry,
    dest: pkg.rollup.dest,
    moduleName: pkg.rollup.moduleName,
    plugins: [
    json({
      exclude: [ 'node_modules/**' ]
    }),
    buble({
      exclude: ['node_modules/**', '*.json']
    })
    ]
}