#!/usr/bin/env node
'use strict'

const inquirer = require('inquirer')
const yargs = require('yargs')
const pkgMgr = require('../lib/packageManager')
const Marshall = require('../lib/marshall')

const cli = yargs
  .command({
    command: 'install [package...]',
    aliases: ['i', 'add'],
    desc: 'install a package'
  })
  .command({
    command: '--packageManager [packageManager]',
    aliases: ['--pkgMgr'],
    desc: 'the package manager to offload handling the command',
    builder: yargs => yargs.default('packageManager', 'npm')
  })
  .help(false)
  .version(false).argv

const marshall = new Marshall({
  pkgs: cli.package
})

marshall
  .process()
  .then(result => {
    if (result && result.error) {
      console.log()
      return inquirer.prompt([
        {
          type: 'confirm',
          name: 'install',
          message: 'Would you like to continue installing package(s)?',
          default: false
        }
      ])
    }

    return { install: true }
  })
  .then(status => {
    if (status && status.hasOwnProperty('install') && status.install === true) {
      pkgMgr.process(cli.packageManager, cli.package)
    }
  })
  .catch(error => {
    console.error(error)
    process.exit(-1)
  })
