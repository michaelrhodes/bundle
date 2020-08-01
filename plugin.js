module.exports = plugin

var collapse = require('bundle-collapser/plugin')
var flatten = require('browser-pack-flat/plugin')
var shake = require('common-shakeify')
var minify = require('minify-stream')
var envify = require('envify/custom')
var uglify = require('uglifyify')
var quiet = require('stripify')

function plugin (b, opts) {
  var env = Object.assign({}, process.env, opts.env)

  // Hard-code `process.env` values
  b.transform(envify(env), { global: true })

  // Remove `console` method calls
  if (!b._options.console) {
    b.transform(quiet, { global: true, replacement: 'void 0' })
  }

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
  if (!b._options.maximize) b.pipeline.get('pack').push(minify({
    output: { ascii_only: true },
    mangle: { safari10: true },
    sourceMap: b._options.sourceMap
  }))
}
