import path from 'node:path'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

import dts from 'vite-plugin-dts'
import bannerPlugin from 'vite-plugin-banner'
import { defineConfig, type Plugin } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

import { css } from './sass.config.ts'
import packageJson from './package.json' with { type: 'json' }

const { name, version, homepage } = packageJson

const typescript6Require = createRequire(
    createRequire(import.meta.url).resolve('@typescript/typescript6'),
)
const typescript6Folder = path.dirname(typescript6Require.resolve('@typescript/old/package.json'))

const UMD_MODE = 'umd'
const OL_INTEROP_PREFIX = '\0ol-interop:'

function commonJsTypes(): Plugin {
    return {
        generateBundle(outputOptions) {
            if (outputOptions.format !== 'umd') return
            this.emitFile({
                fileName: 'ol-contextmenu.d.cts',
                source: readFileSync('types/ol-contextmenu.d.cts', 'utf8'),
                type: 'asset',
            })
        },
        name: 'commonjs-types',
    }
}

function olDefaultInterop(): Plugin {
    return {
        load(id) {
            if (!id.startsWith(OL_INTEROP_PREFIX)) return null
            const source = id.slice(OL_INTEROP_PREFIX.length)
            return [
                `import * as namespace from '${source}'`,
                'const value = namespace.default',
                'export default value && value.__esModule ? value.default : value',
            ].join('\n')
        },
        name: 'ol-default-interop',
        resolveId(source, importer) {
            if (!source.startsWith('ol/') || !importer || importer.startsWith(OL_INTEROP_PREFIX)) {
                return null
            }
            return `${OL_INTEROP_PREFIX}${source}`
        },
    }
}

const banner = `
  /*!
  * ${name} - v${version}
  * ${homepage}
  * Built: ${new Date().toISOString()}
  */
`

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
                      external: (source, importer) =>
                          source.startsWith('ol/')
                          && (mode !== UMD_MODE
                              || importer?.startsWith(OL_INTEROP_PREFIX) === true),
                      output: {
                          globals: {
                              'ol/control/Control.js': 'ol.control.Control',
                              'ol/MapBrowserEvent.js': 'ol.MapBrowserEvent',
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
                  mode === UMD_MODE && olDefaultInterop(),
                  mode === UMD_MODE && commonJsTypes(),
                  mode !== UMD_MODE
                      && dts({
                          bundleTypes: {
                              invokeOptions: { typescriptCompilerFolder: typescript6Folder },
                          },
                          compilerOptions: { rootDir: 'src' },
                          exclude: [
                              'src/umd.ts',
                              'src/**/*.spec.ts',
                              'src/**/*.test.ts',
                              'tests/**',
                              '**/*.config.ts',
                          ],
                          include: ['src/**/*.ts'],
                          outDirs: 'dist',
                      }),
                  bannerPlugin(banner),
                  cssInjectedByJsPlugin(),
              ],
          },
)
