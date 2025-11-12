import dts from 'vite-plugin-dts'
import bannerPlugin from 'vite-plugin-banner'
import { defineConfig, type CSSOptions } from 'vite'

import { CSS_CLASSES } from './src/constants.ts'
import { name, version, homepage } from './package.json'

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

const css: CSSOptions = {
    preprocessorOptions: {
        scss: {
            additionalData,
            silenceDeprecations: ['import'],
        },
    },
}

export default defineConfig(({ command }) =>
    command === 'serve'
        ? {
                build: { target: 'es2020' },
                css,
            }
        : {
                build: {
                    lib: {
                        entry: './src/main.ts',
                        fileName: 'ol-contextmenu',
                        formats: ['es', 'umd', 'iife'],
                        name: 'ContextMenu',
                    },
                    rollupOptions: {
                        external: [/^ol.*/],
                        output: {
                            assetFileNames: () => 'ol-contextmenu.css',
                            globals: {
                                'ol/control/Control': 'ol.control.Control',
                                'ol/MapBrowserEvent': 'ol.MapBrowserEvent',
                            },
                        },
                    },
                    target: 'es2020',
                },
                css,
                define: {
                    __APP_VERSION__: JSON.stringify(version),
                },
                plugins: [dts({ insertTypesEntry: true }), bannerPlugin(banner)],
            },
)
