module.exports = js

var browserify = require('browserify')
var collapse = require('bundle-collapser/plugin')
var flatten = require('browser-pack-flat/plugin')
var shake = require('common-shakeify')
var minify = require('minify-stream')
var envify = require('envify/custom')
var uglify = require('uglifyify')
var quiet = require('stripify')
var es53 = require('es5.3')
var mri = require('mri')

function js (argv) {
  var args = mri(argv, {
    alias: {
      n: 'node',
      e: 'export',
      u: 'universal',
      c: 'console',
      m: 'maximise',
      s: 'sourceMap',
      t: 'transform',
      g: 'globalTransform',
      p: 'plugin'
    }
  })

  var opts = {
    es6: args.es6,
    bare: !args.node,
    entries: args._[0],
    console: args.console,
    maximise: args.maximise,
    sourceMap: args.sourceMap,
    transform: args.transform,
    universal: args.universal,
    globalTransform: args.globalTransform,
    plugin: [plugin].concat(args.plugin || [])
  }

  if (args.export) opts.standalone = args.export

  browserify(opts).bundle().pipe(process.stdout)
}

function plugin (b, opts) {
  var env = Object.assign({}, process.env, opts.env)

  // Hard-code `process.env` values
  b.transform(envify(env), {
    global: true
  })

  // Transform arrow functions,
  // shorthand object properties,
  // and template literals into es5
  if (!b._options.es6) b.transform(es53, {
    global: true
  })

  // Remove `console` method calls
  if (!b._options.console) b.transform(quiet, {
    replacement: 'void 0',
    global: true
  })

  // Remove dead code
  if (!b._options.maximize) b.transform(uglify, {
    output: { ascii_only: true },
    global: true,
    mangle: false,
    toplevel: true
  })

  // Replace require paths with numeric ids
  b.plugin(collapse)

  // Flatten code into a single scope
  b.plugin(flatten, b._options)

  // Remove unused exports
  b.plugin(shake)

  // Minify the final output
  if (!b._options.maximise) b.pipeline.get('pack').push(minify({
    output: { ascii_only: true },
    mangle: { safari10: true },
    sourceMap: b._options.sourceMap
  }))
}
