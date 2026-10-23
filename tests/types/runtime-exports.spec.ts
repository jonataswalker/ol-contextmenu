import path from 'node:path'
import { createRequire } from 'node:module'
import process from 'node:process'
import { readFileSync } from 'node:fs'
import { runInThisContext } from 'node:vm'

import Control from 'ol/control/Control'
import MapBrowserEvent from 'ol/MapBrowserEvent'
import { it, expect, afterEach } from 'vitest'
import * as esm from 'ol-contextmenu'

type ScriptGlobals = typeof globalThis & { ContextMenu?: unknown; ol?: unknown }

const scriptGlobals: ScriptGlobals = globalThis

function loadScript(file: string): unknown {
    scriptGlobals.ol = { control: { Control }, MapBrowserEvent }
    runInThisContext(readFileSync(path.join(process.cwd(), 'dist', file), 'utf8'))
    return scriptGlobals.ContextMenu
}

afterEach(() => {
    scriptGlobals.ContextMenu = null
    delete scriptGlobals.ol
})

it('ESM build exports every value the types declare', () => {
    expect(Object.keys(esm).toSorted()).toEqual([
        'ContextMenuEvent',
        'CustomEventTypes',
        'EventTypes',
        'default',
    ])
    expect(esm.EventTypes.CLICK).toBe('click')
    expect(esm.CustomEventTypes.OPEN).toBe('open')
})

it.each(['ol-contextmenu.umd.cjs', 'ol-contextmenu.iife.js'])(
    '%s exposes the class itself as the ContextMenu global',
    (file) => {
        const global = loadScript(file)

        if (typeof global !== 'function') throw new TypeError(`${file} did not define a ContextMenu class`)

        expect(Reflect.get(global.prototype, 'extend')).toBeTypeOf('function')
        expect(global).not.toHaveProperty('default')
    },
)

it('require() returns the class from the CommonJS build', () => {
    const required: unknown = createRequire(import.meta.url)('ol-contextmenu')

    if (typeof required !== 'function') throw new TypeError('require() did not return the ContextMenu class')

    expect(Reflect.get(required.prototype, 'extend')).toBeTypeOf('function')
    expect(required).not.toHaveProperty('default')
})
