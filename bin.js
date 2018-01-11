#!/usr/bin/env node

var browserify = require('browserify')
var tinyify = require('./plugin/tinyify')

var entry = process.argv[2]
var standalone = /^(-s|--standalone)$/.test(process.argv[3])
var opts = { entries: [entry], plugin: [tinyify] }
if (standalone) opts.standalone = 'x'

browserify(opts).bundle().pipe(process.stdout)
