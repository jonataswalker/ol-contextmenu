import path from 'node:path'
import process from 'node:process'
import { execFileSync } from 'node:child_process'
import { cpSync, lstatSync, mkdirSync, readdirSync, rmSync } from 'node:fs'

const root = process.cwd()
const workDir = path.join(root, '.examples-check')
const examples = ['my-project-with-vite', 'my-project-with-webpack']
const skippedFolders = /[/\\](?:node_modules|dist)(?:[/\\]|$)/

const childEnv = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.toLowerCase().startsWith('npm_config_')),
)

function run(command, args, cwd) {
    execFileSync(command, args, { cwd, env: childEnv, stdio: 'inherit' })
}

rmSync(workDir, { force: true, recursive: true })
mkdirSync(workDir, { recursive: true })
run('npm', ['pack', '--pack-destination', workDir], root)

const tarball = readdirSync(workDir).find((file) => file.endsWith('.tgz'))
if (!tarball) throw new Error('npm pack produced no tarball')

for (const example of examples) {
    const source = path.join(root, 'examples', example)
    const target = path.join(workDir, example)

    cpSync(source, target, { filter: (file) => !skippedFolders.test(`${path.sep}${path.relative(source, file)}`), recursive: true })
    run('npm', ['install', '--no-audit', '--no-fund', path.join(workDir, tarball)], target)

    if (lstatSync(path.join(target, 'node_modules', 'ol-contextmenu')).isSymbolicLink()) {
        throw new Error(`${example} links ol-contextmenu instead of installing the packed tarball`)
    }

    run('npm', ['run', 'build'], target)
    console.log(`${example}: built against ${tarball}`)
}
