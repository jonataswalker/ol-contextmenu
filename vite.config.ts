import path from 'node:path'
import { createRequire } from 'node:module'

import dts from 'vite-plugin-dts'
import bannerPlugin from 'vite-plugin-banner'
import { defineConfig, type CSSOptions } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

import { CSS_CLASSES } from './src/constants.ts'
import packageJson from './package.json' with { type: 'json' }

const { name, version, homepage } = packageJson

const typescript6Require = createRequire(createRequire(import.meta.url).resolve('@typescript/typescript6'))
const typescript6Folder = path.dirname(typescript6Require.resolve('@typescript/old/package.json'))

const UMD_MODE = 'umd'

const banner = `
  /*!
  * ${name} - v${version}
  * ${homepage}
  * Built: ${new Date().toISOString()}
  */
`

const additionalData = Object.entries(CSS_CLASSES).reduce(
    (accumulator, [key, value]) => `${accumulator}$${key}:${value};`,
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

export default defineConfig(({ command, mode }) =>
    command === 'serve'
        ? {
                build: { target: 'es2020' },
                css,
            }
        : {
                build: {
                    cssCodeSplit: false,
                    emptyOutDir: mode !== UMD_MODE,
                    lib:
                        mode === UMD_MODE
                            ? {
                                    entry: './src/umd.ts',
                                    fileName: 'ol-contextmenu',
                                    formats: ['umd', 'iife'],
                                    name: 'ContextMenu',
                                }
                            : {
                                    entry: './src/main.ts',
                                    fileName: 'ol-contextmenu',
                                    formats: ['es'],
                                },
                    rollupOptions: {
                        external: [/^ol.*/],
                        output: {
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
                plugins: [
                    mode !== UMD_MODE
                    && dts({
                        bundleTypes: { invokeOptions: { typescriptCompilerFolder: typescript6Folder } },
                        compilerOptions: { rootDir: 'src' },
                        exclude: ['src/umd.ts', 'src/**/*.spec.ts', 'src/**/*.test.ts', 'tests/**', '**/*.config.ts'],
                        include: ['src/**/*.ts'],
                        outDirs: 'dist',
                    }),
                    bannerPlugin(banner),
                    cssInjectedByJsPlugin(),
                ],
            },
)
