import { readFileSync } from 'fs';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import bannerPlugin from 'vite-plugin-banner';

import { CSS_CLASSES } from './src/constants';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const banner = `
  /*!
  * ${pkg.name} - v${pkg.version}
  * ${pkg.homepage}
  * Built: ${new Date()}
  */
`;

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
                      formats: ['es', 'umd', 'iife'],
                  },
                  rollupOptions: {
                      external: ['vue', /^ol.*/],
                      output: {
                          globals: {
                              'ol/MapBrowserEvent': 'MapBrowserEvent',
                              'ol/control/Control': 'Control',
                          },
                          assetFileNames: () => 'ol-contextmenu.css',
                      },
                  },
              },
              plugins: [dts({ insertTypesEntry: true }), bannerPlugin(banner)],
              define: {
                  __APP_VERSION__: JSON.stringify(pkg.version),
              },
          }
);
