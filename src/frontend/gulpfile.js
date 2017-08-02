var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var watchify = require('watchify')

gulp.task('bundle', function () {
   var appBundler = browserify({
       entries: ['src/index.js'],
       transform: [
           ['babelify', {
               "presets": ['es2015', 'react'],
               "plugins": ['transform-object-rest-spread'],
               "compact" : false
           }
           ],
           ['browserify-css']
       ]
   }, { debug : true });
  return appBundler
    .bundle()
    .on('error', function (err) {
      console.error(err.message)
      console.error(err.codeFrame)
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('static/'))
})

gulp.task('watch',function () {
  var appBundler = browserify({
    entries: ['src/index.js'],
    transform: [
      ['babelify', {
        "presets": ['es2015', 'react'],
        "plugins": ['transform-object-rest-spread'],
        "compact" : false
        }
      ],
      ['browserify-css']
    ],
    cache: {},
    packageCache: {},
    // plugin: [watchify],
  }, { debug : true });



  //appBundler = watchify(appBundler,{delay:1000,poll:true,ignoreWatch:true})
  //appBundler.plugin(makeBundle,{delay:100,poll:true})

  appBundler.on('update', makeBundle)

  function makeBundle () {

      console.log("updated")
      appBundler
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

  return appBundler
})

gulp.task('watcher', function () {
    gulp.watch(['./src/**/*.js'], ['watch']);
});

gulp.task('default', ['watch'])


