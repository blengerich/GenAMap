var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var watchify = require('watchify')

gulp.task('bundle', function () {
  return browserify('src/index.js')
    .transform('babelify', {presets: ['es2015', 'react'], 'plugins': ['transform-object-rest-spread'], 'compact': false})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('static/'))
})

gulp.task('watch', function () {
  var b = browserify({
    entries: ['src/index.js'],
    cache: {}, packageCache: {},
    plugin: [watchify]
  })

  b.on('update', makeBundle)

  function makeBundle () {
    b.transform('babelify', {presets: ['es2015', 'react'], 'plugins': ['transform-object-rest-spread'], 'compact': false})
      .bundle()
      .on('error', function (err) {
        console.error(err.message)
        console.error(err.codeFrame)
      })
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('static/'))
    console.log('Bundle updated, success')
  }

  makeBundle()

  return b
})

gulp.task('default', ['watch'])
