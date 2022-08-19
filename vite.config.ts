import { readFileSync } from 'fs';

import { defineConfig } from 'vite';

import { CSS_CLASSES } from './src/constants';
// import legacy from '@vitejs/plugin-legacy';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = `
  /*!
  * ${pkg.name} - v${pkg.version}
  * ${pkg.homepage}
  * Built: ${new Date()}
  */
`;
// eslint-disable-next-line @typescript-eslint/no-shadow
const external = ['ol/control/Control', 'ol/PluggableMap', 'ol'];
const globals = {
    'ol/control/Control': 'ol.control.Control',
    ol: 'ol',
};

const additionalData = Object.keys(CSS_CLASSES).reduce(
    (accumulator, current) => `${accumulator}$${current}:${CSS_CLASSES[String(current)]};`,
    ''
);

const css = { preprocessorOptions: { scss: { additionalData } } };

export default defineConfig(({ command }) =>
    command === 'serve'
        ? {
              css,
              build: { target: 'es2020' },
          }
        : {
              css,
              build: {
                  target: 'es2020',
                  lib: {
                      entry: './src/main.ts',
                      name: 'ContextMenu',
                      fileName: 'ol-contextmenu',
                  },
                  rollupOptions: {
                      external,
                      output: { globals, assetFileNames: () => 'ol-contextmenu.css' },
                  },
              },
              define: {
                  __APP_VERSION__: JSON.stringify(pkg.version),
              },
          }
);
