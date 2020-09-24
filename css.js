module.exports = css

var fs = require('fs')
var postcss = require('postcss')
var imports = require('postcss-import')
var presets = require('postcss-preset-env')
var prefix = require('autoprefixer')
var mini = require('cssnano')
var mri = require('mri')

async function css (argv) {
  var args = mri(argv, {
    alias: { m: 'maximise' }
  })

  var processor = postcss()
  processor.use(imports())
  processor.use(prefix({ grid: 'autoplace' }))
  processor.use(presets())
  if (!args.maximise) processor.use(mini())

  try {
    var file = extension(args._[0])
    var css = fs.readFileSync(file)
    var bundle = processor.process(css, { from: file })
    bundle.then(function (output) {
      process.stdout.write(output.toString())
    })
  }
  catch (err) {
    console.error(err.stack)
    process.exit(1)
  }
}

function extension (file) {
  return file.replace(/(\.css)?$/, '.css')
}
