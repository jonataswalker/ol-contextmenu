import { readFileSync } from 'fs';
import nodeResolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import includePaths from 'rollup-plugin-includepaths';
import { eslint } from 'rollup-plugin-eslint';
import bundleSize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';
import sass from 'rollup-plugin-sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssVars from './src/cssVars';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const external = Object.keys(pkg.dependencies);
external.push('ol/control/Control');

const globals = {
  'ol/control/Control': 'ol.control.Control',
};

const lintOpts = {
  // extensions: ['js'],
  exclude: ['**/*.scss'],
  cache: true,
  throwOnError: true,
};

const includePathOptions = {
  paths: ['', './src'],
};

const banner = `
  /*!
  * ${pkg.name} - v${pkg.version}
  * ${pkg.homepage}
  * Built: ${new Date()}
  */
`;

const scssVars = Object.keys(cssVars).reduce(
  (p, k) => `${p}$${k}:${cssVars[k]};`,
  ''
);

const processor = css =>
  postcss([autoprefixer])
    .process(css, { from: undefined })
    .then(result => banner + result.css);

const sassOpts = { data: scssVars, sourceMap: false };

const cssMinOpts = {
  processor,
  output: 'dist/ol-contextmenu.min.css',
  options: { ...sassOpts, outputStyle: 'compressed' },
};

const cssOpts = {
  processor,
  output: 'dist/ol-contextmenu.css',
  options: { ...sassOpts, outputStyle: 'expanded' },
};

const plugins = [
  includePaths(includePathOptions),
  eslint(lintOpts),
  bundleSize(),
  nodeResolve(),
  commonjs(),
  buble({ target: { ie: 11 } }),
];

export default [
  {
    external,
    input: './src/base.js',
    output: {
      banner,
      globals,
      file: './dist/ol-contextmenu.js',
      format: 'umd',
      name: 'ContextMenu',
    },
    plugins: [
      sass(cssMinOpts),
      ...plugins,
      terser({ output: { comments: /^!/ } }),
    ],
  },
  {
    external,
    input: './src/base.js',
    output: {
      banner,
      globals,
      file: './dist/ol-contextmenu-debug.js',
      format: 'umd',
      name: 'ContextMenu',
    },
    plugins: [sass(cssOpts), ...plugins],
  },
];
