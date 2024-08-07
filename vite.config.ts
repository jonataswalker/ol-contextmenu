import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'
import bannerPlugin from 'vite-plugin-banner'

import { name, version, homepage } from './package.json'
import { CSS_CLASSES } from './src/constants'

const banner = `
  /*!
  * ${name} - v${version}
  * ${homepage}
  * Built: ${new Date().toISOString()}
  */
`

const additionalData = Object.keys(CSS_CLASSES).reduce(
    (accumulator, current) => `${accumulator}$${current}:${CSS_CLASSES[current as keyof typeof CSS_CLASSES]};`,
    '',
)

const css = { preprocessorOptions: { scss: { additionalData } } }

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
                        external: [/^ol.*/],
                        output: {
                            globals: {
                                'ol/MapBrowserEvent': 'ol.MapBrowserEvent',
                                'ol/control/Control': 'ol.control.Control',
                            },
                            assetFileNames: () => 'ol-contextmenu.css',
                        },
                    },
                },
                plugins: [dts({ insertTypesEntry: true }), bannerPlugin(banner)],
                define: {
                    __APP_VERSION__: JSON.stringify(version),
                },
            },
)
