import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import process from 'node:process'

const root = new URL('../', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'))
const pinnedTsrs = manifest.devDependencies.tsrs

const checkers = [
    {
        label: 'tsrs (primary)',
        bin: 'node_modules/.bin/tsrs',
        accepts: (output) => output.includes(`(tsrs ${pinnedTsrs},`),
        expected: `tsrs ${pinnedTsrs}, pinned exactly in package.json`,
    },
    {
        label: 'TypeScript 7 (second pass)',
        bin: 'node_modules/typescript/bin/tsc',
        accepts: (output) => output.startsWith('Version 7.'),
        expected: 'TypeScript 7.x',
    },
    {
        label: 'TypeScript 6 (consumer compatibility)',
        bin: 'node_modules/.bin/tsc6',
        accepts: (output) => output.startsWith('Version 6.'),
        expected: 'TypeScript 6.x',
    },
]

function readVersion(bin) {
    const result = spawnSync(process.execPath, [new URL(bin, root).pathname, '--version'], {
        encoding: 'utf8',
    })

    return `${result.stdout}${result.stderr}`.trim()
}

const pinIsExact = /^\d+\.\d+\.\d+(?:-[\w.]+)?$/u.test(pinnedTsrs ?? '')
const failures = pinIsExact
    ? []
    : [`tsrs must be pinned to an exact version, found "${pinnedTsrs}"`]

for (const { label, bin, accepts, expected } of checkers) {
    const output = readVersion(bin)

    console.log(`${label}: ${bin} -> ${output}`)

    if (!accepts(output)) failures.push(`${label} must be ${expected}, got "${output}"`)
}

if (failures.length > 0) {
    console.error(failures.join('\n'))
    process.exit(1)
}
