const exec = require('child_process').execSync
const path = require('path')
const assert = require('assert')
const fs = require('fs-extra')
const consola = require('consola')
const { switchApi, backupApi, restoreApi } = require('./switch')
const { selectVersion } = require('./selectVersion')

const rootDir = path.resolve(__dirname, '..')
const packageJSONDir = path.join(rootDir, 'package.json')

assert(process.cwd() !== __dirname)

async function buildFor (targetVersion, publishCallback) {
  assert([2, 3].includes(targetVersion))
  consola.log('')
  consola.info(`Build for Vue ${targetVersion}.x`)

  const rawPackageJSON = await fs.readFile(packageJSONDir)
  const packageJSON = JSON.parse(rawPackageJSON)

  const version = [targetVersion, ...packageJSON.version.split('.').slice(1)].join('.')

  consola.info(version)

  packageJSON.version = version

  if (targetVersion === 2) {
    packageJSON.peerDependencies = {
      vue: '^2.6.0',
      '@vue/composition-api': '^0.3.0',
    }
  }

  if (targetVersion === 3) {
    packageJSON.peerDependencies = {
      vue: 'next',
    }
  }

  await fs.writeFile(packageJSONDir, JSON.stringify(packageJSON, null, 2))
  await backupApi()
  await switchApi(targetVersion)

  try {
    consola.info('Clean up')
    exec('npm run clear', { stdio: 'inherit' })

    consola.info('Generate Declarations')
    exec('tsc --emitDeclarationOnly', { stdio: 'inherit' })

    consola.info('Rollup')
    exec('rollup -c', { stdio: 'inherit' })

    consola.success(`Build for Vue ${targetVersion}.x finished`)

    if (publishCallback)
      await publishCallback()
  }
  catch (e) {
    console.error(e)
  }

  // restore packageJSON
  await fs.writeFile(packageJSONDir, rawPackageJSON)
  await restoreApi()
}

async function buildAll () {
  await buildFor(2)
  await buildFor(3)
}

async function cli () {
  try {
    const version = await selectVersion()
    if (version)
      await buildFor(version)
    else if (version === 0)
      await buildAll()
  }
  catch (e) {
    console.error(e)
  }
}

module.exports = {
  buildFor,
}

if (require.main === module)
  cli()
