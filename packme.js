/* to move into a module */
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import globby from 'globby';
import Table from 'cli-table';
import packageJson from 'package-json';
import semver from 'semver';
const config = JSON.parse(fs.readFileSync('package.json'));

function timeout (delay) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve('Ok done!');
      //reject(new Error('problem'));
    }, delay);
  })
}

function getPackage (module) {
  return new Promise((resolve, reject) => {
    packageJson(module, 'latest').then(resolve).catch(reject);
  });
}


async function foo () {
  console.log('waiting...');
  try {
    var result = await timeout(1000);
    //var result = await getPackage('axios');
    console.log('result:', result);
  } catch (err) {
    console.log(err.toString());
  }
}

//foo();

function readPackageJson(filename) {
  let pkg;
  let error;
  try {
    pkg = require(filename);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      error = new Error(`A package.json was not found at ${filename}`);
    } else {
      error = new Error(`A package.json was found at ${filename}, but it is not valid.`);
    }
  }
  return Object.assign(pkg, {devDependencies: {}, dependencies: {}, error: error});
}

function getInstalledPackages (cwd) {
  const GLOBBY_PACKAGE_JSON = '{*/package.json,@*/*/package.json}';
  const installedPackages = globby.sync(GLOBBY_PACKAGE_JSON, {cwd: cwd});

  return _(installedPackages)
  .map(pkgPath => {
    const pkg = readPackageJson(path.resolve(cwd, pkgPath));
    return [pkg.name, pkg.version];
  })
  .fromPairs()
  .valueOf();
}
async function checkDependencies(dependencies) {
  let table = new Table({
    head: ['module', 'local version', 'latest version']
  });

  let nodeModulesPath = path.join(process.cwd(), 'node_modules');
  let installedPackages = getInstalledPackages(nodeModulesPath);

  //console.log(installedPackages)

  for(let dependency in dependencies) {
    if( dependencies.hasOwnProperty(dependency) ) {
      let module = await getPackage(dependency);
      let local = installedPackages[dependency];
      let remote = module.version;

      //console.log(dependencies[dependency], module.version;
      //console.log('dependency: [%s]: %s', dependency, local, remote, semver.compare(remote, local))
      table.push([dependency, local, remote]);
    }
  }
  console.log(table.toString());
}

checkDependencies(config.devDependencies)
/*
async function printDeps () {
  let table = new Table({
    head: ['module', 'version']
  });
  let modules = Object.keys(config.devDependencies);

  modules.forEach(module => {
    let version = config.devDependencies[module];
    let registry = await getPackage(module);
    table.push([module, version]);
  })
  console.log(table.toString());

}

printDeps();
*/
