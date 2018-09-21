import { readFileSync } from 'fs';
import nodeResolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import includePaths from 'rollup-plugin-includepaths';
import bundleSize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const external = Object.keys(pkg.dependencies);
external.push('ol/control/Control');

const globals = {
  'ol/control/Control': 'ol.control.Control'
};

const lintOpts = {
  // extensions: ['js'],
  exclude: ['**/*.json'],
  cache: true,
  throwOnError: true
};

const includePathOptions = {
  paths: ['', './src']
};

const banner = readFileSync('./build/banner.js', 'utf-8')
  .replace('${name}', pkg.name)
  .replace('${description}', pkg.description)
  .replace('${homepage}', pkg.homepage)
  .replace('${version}', pkg.version)
  .replace('${time}', new Date());

export default [
  {
    external,
    input: './src/base.js',
    output: {
      banner,
      globals,
      file: './dist/ol-contextmenu.js',
      format: 'umd',
      name: 'ContextMenu'
    },
    plugins: [
      includePaths(includePathOptions),
      eslint(lintOpts),
      bundleSize(),
      nodeResolve(),
      commonjs(),
      json({ exclude: 'node_modules/**' }),
      buble({ target: { ie: 11 } }),
      terser({ output: { comments: /^!/ } })
    ]
  },
  {
    external,
    input: './src/base.js',
    output: {
      banner,
      globals,
      file: './dist/ol-contextmenu-debug.js',
      format: 'umd',
      name: 'ContextMenu'
    },
    plugins: [
      includePaths(includePathOptions),
      eslint(lintOpts),
      bundleSize(),
      nodeResolve(),
      commonjs(),
      json({ exclude: 'node_modules/**' }),
      buble({ target: { ie: 11 } })
    ]
  }
];
