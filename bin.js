#!/usr/bin/env node

var path = require('path')
var browserify = require('browserify')
var find = require('find-pkg')
var tinyify = require('./plugin/tinyify')

var entry = process.argv[2]
var standalone = /^(-s|--standalone)$/.test(process.argv[3])
var name = process.argv[4]
var opts = {
  entries: [entry],
  plugin: [tinyify],
}

if (standalone) {
  opts.standalone = name || lookup(entry)
}

browserify(opts)  
  .bundle()
  .pipe(process.stdout)

function lookup (file, pkg) {
  return (pkg = find.sync(file)) ?
    require(pkg).name : 'bundle'
}
