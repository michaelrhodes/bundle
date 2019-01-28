#!/usr/bin/env node

var mri = require('mri')
var browserify = require('browserify')
var tinyify = require('./plugin/tinyify')
var args = mri(process.argv.slice(2), {
  alias: { s: 'standalone', t: 'transform', p: 'plugin' }
})

var opts = {
  entries: args._[0],
  transform: args.transform,
  plugin: [tinyify].concat(args.plugin || [])
}

if (args.standalone) opts.standalone = 'x'

browserify(opts).bundle().pipe(process.stdout)
