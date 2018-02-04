var packFlatStream = require('browser-pack-flat')
var packFlat = require('browser-pack-flat/plugin')
var collapser = require('bundle-collapser/plugin')
var commonShake = require('common-shakeify')
var envify = require('envify/custom')
var uglify = require('minify-stream')
var split = require('split-require')
var uglifyify = require('uglifyify')
var unassertify = require('unassertify')

function makeUglifyOptions (debug) {
  var uglifyOpts = {
    output: {
      ascii_only: true
    },
    mangle: {
      safari10: true
    }
  }
  if (!debug) {
    uglifyOpts.sourceMap = false
  }
  return uglifyOpts
}

module.exports = function (b, opts) {
  if (typeof b !== 'object') {
    throw new Error('tinyify: must be used as a plugin, not a transform')
  }

  var env = Object.assign({}, process.env, opts.env)

  // Remove `assert()` calls.
  b.transform(unassertify, { global: true })
  // Replace `process.env.NODE_ENV` with "production".
  b.transform(envify(env), { global: true })
  // Remove dead code.
  b.transform(uglifyify, {
    global: true,
    toplevel: true,
    // No need to mangle here, will do that at the end.
    mangle: false,
    output: { ascii_only: true }
  })

  // Split async requires into their own files.
  b.plugin(split)

  // Replace file paths in require() calls with module IDs.
  b.plugin(collapser)

  // Output a flat bundle, without function wrappers for each module.
  b.plugin(packFlat)

  // Remove unused exports from modules.
  b.plugin(commonShake)

  // Minify the final output.
  var uglifyOpts = makeUglifyOptions(b._options.debug)
  b.pipeline.get('pack').push(uglify(uglifyOpts))
}

module.exports.applyToPipeline = function applyToPipeline (pipeline, opts) {
  opts = Object.assign({
    debug: false,
    basedir: process.cwd()
  }, opts)

  pipeline.get('pack').splice(0, 1, packFlatStream({
    raw: true,
    debug: opts.debug,
    basedir: opts.basedir
  }))

  // Minify the final output.
  var uglifyOpts = makeUglifyOptions(opts.debug)
  pipeline.get('pack').push(uglify(uglifyOpts))
}
