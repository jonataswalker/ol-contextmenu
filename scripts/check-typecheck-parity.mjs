import { spawnSync } from 'node:child_process'
import { appendFileSync, cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import process from 'node:process'

const root = new URL('../', import.meta.url)
const scratch = new URL('.parity-check/', root)

const checkers = [
    { label: 'tsrs', bin: 'node_modules/.bin/tsrs' },
    { label: 'TypeScript 7', bin: 'node_modules/typescript/bin/tsc' },
]

const srcError = `
export const parityBadEventType = new ContextMenu({ eventType: 'hover' })
`

const consumerError = `
export const parityBadWidth = new ContextMenu({ width: '180px' })
expectTypeOf<ItemSeparator>().toEqualTypeOf<'--'>()
`

function run({ label, bin }, project) {
    const result = spawnSync(
        process.execPath,
        [new URL(bin, root).pathname, '--noEmit', '--pretty', 'false', '-p', project],
        { cwd: root, encoding: 'utf8' },
    )
    const diagnostics = result.stdout
        .split('\n')
        .filter((line) => / error TS\d+:/u.test(line))
        .map((line) => line.trim())
        .toSorted()

    return {
        label,
        status: result.status,
        diagnostics,
        output: `${result.stdout}${result.stderr}`.trim(),
    }
}

function locationAndCode(diagnostic) {
    return diagnostic.replace(/(error TS\d+):.*$/u, '$1')
}

function prepareFixtures() {
    rmSync(scratch, { recursive: true, force: true })
    mkdirSync(new URL('project/', scratch), { recursive: true })
    mkdirSync(new URL('consumer/', scratch), { recursive: true })

    cpSync(new URL('src/', root), new URL('project/src/', scratch), { recursive: true })
    writeFileSync(
        new URL('project/tsconfig.json', scratch),
        JSON.stringify({ extends: '../../tsconfig.json', include: ['src/**/*.ts'], exclude: [] }),
    )
    appendFileSync(new URL('project/src/main.ts', scratch), srcError)

    cpSync(new URL('tests/types/tsconfig.json', root), new URL('consumer/tsconfig.json', scratch))
    cpSync(
        new URL('tests/types/exports.test-d.ts', root),
        new URL('consumer/exports.test-d.ts', scratch),
    )
    appendFileSync(new URL('consumer/exports.test-d.ts', scratch), consumerError)
}

const cases = [
    { name: 'real project', project: '.', expectErrors: false },
    { name: 'real consumer tests', project: 'tests/types', expectErrors: false },
    { name: 'invalid src fixture', project: '.parity-check/project', expectErrors: true },
    { name: 'invalid consumer fixture', project: '.parity-check/consumer', expectErrors: true },
]

prepareFixtures()

const failures = []

for (const { name, project, expectErrors } of cases) {
    const [primary, secondary] = checkers.map((checker) => run(checker, project))

    console.log(`\n## ${name} (${project})`)

    for (const { label, status, diagnostics } of [primary, secondary]) {
        console.log(`${label}: exit ${status}, ${diagnostics.length} error(s)`)
        for (const diagnostic of diagnostics) console.log(`  ${diagnostic}`)
    }

    for (const { label, status, diagnostics, output } of [primary, secondary]) {
        if (expectErrors && (status === 0 || diagnostics.length === 0)) {
            failures.push(`${name}: ${label} accepted code that must fail`)
        }
        if (!expectErrors && status !== 0) failures.push(`${name}: ${label} failed:\n${output}`)
    }

    const primaryKeys = primary.diagnostics.map(locationAndCode)
    const secondaryKeys = secondary.diagnostics.map(locationAndCode)

    if (JSON.stringify(primaryKeys) !== JSON.stringify(secondaryKeys)) {
        failures.push(`${name}: tsrs and TypeScript 7 report different errors`)
    } else if (JSON.stringify(primary.diagnostics) !== JSON.stringify(secondary.diagnostics)) {
        console.log('Same locations and codes; message text differs (reported, not a failure).')
    }
}

rmSync(scratch, { recursive: true, force: true })

if (failures.length > 0) {
    console.error(`\n${failures.join('\n')}`)
    process.exit(1)
}

console.log('\ntsrs and TypeScript 7 agree on every case.')
