const gulp = require('gulp'),
      sass = require('gulp-sass'),
      browserify = require('browserify'),
      babelify = require('babelify'),
      uglify = require('gulp-uglify'),
      fs = require('fs'),
      gutil = require('gulp-util'),
      concat = require('gulp-concat'),
      source = require('vinyl-source-stream'),
      rev = require('gulp-rev'),
      clean = require('gulp-clean'),
      cleanCSS = require('gulp-clean-css'),
      runSequence = require('run-sequence');


gulp.task('default', ['sass:watch']);

gulp.task('copy-index', function () {
    gulp.src('./index.html')
        .pipe(gulp.dest('./build/'));
});

// entry point for CSS build task sequence
gulp.task('build-css', function(){
  runSequence('copy-index', 'reset-css', 'sass', 'concat-css', 'minify-css', 'clean-css', 'inject-css');
})

// wipe all CSS files from /build
gulp.task('reset-css', function(){
  return gulp.src('build/*.css')
    .pipe(clean());
});

// remove app CSS from /build
gulp.task('clean-css', function(){
  return gulp.src('build/app.css')
    .pipe(clean());

});

// compile all SASS in static/sass main.scss into CSS
gulp.task('sass', function () {
  return gulp.src('./static/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./static/css'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./static/sass/**/*.scss', ['sass', 'inject']);
});

// concat all CSS files (including bower includes) into single file
gulp.task('concat-css', function(){
  var json = JSON.parse(fs.readFileSync('./static/assets.json'));

  return gulp.src(json['stylesheets'])
    .pipe(concat('app.css'))
    .pipe(gulp.dest('./build'));
});

// compress and versionize single CSS file from concat
gulp.task('minify-css', function(){
  return gulp.src('./build/app.css')
    .pipe(cleanCSS())
    .pipe(rev())
    .pipe(gulp.dest('build'));
});

// inject compressed, versioned CSS file into index.html
gulp.task('inject-css', function(){
  var inject = require('gulp-inject');
  var injectSrc = gulp.src(['./build/*.css'], {read: false});

  return gulp.src('./build/index.html')
        .pipe(inject(injectSrc))
        .pipe(gulp.dest('./build'));
});

// entry point for JS build task sequence
gulp.task('build-js', function(){
  runSequence('reset-js', 'clean-js', 'browserify', 'concat-js', 'clean-js', 'inject-js');
});

// remove versioned production build from /build
gulp.task('reset-js', function(){
  return gulp.src('build/*.min.js')
    .pipe(clean());

});

// remove browserified app JS file from /build
gulp.task('clean-js', function(){
  return gulp.src('build/app.js')
    .pipe(clean());

});

// take React / ES6 app code and compile
// to browser-friendly version in /build
gulp.task('browserify', function(){
  return browserify('./src/index.js')
    .transform(babelify, {
      presets: ['es2015', 'react'],
      sourceMaps: true
    })
    .bundle()
    .on('error', function (err) {
      gutil.log(err.toString());
      this.emit('end');
    })
    .pipe(source('app.js'))
    .pipe(gulp.dest('./build'));

});

// take all listed JS dependencies and concat into single, versioned
// production build in /build
gulp.task('concat-js', function(){
  var json = JSON.parse(fs.readFileSync('./static/assets.json'));

  return gulp.src(json['scripts'])
    .pipe(uglify())
    .on('error', function(err){
      gutil.log(err.toString());
    })
    .pipe(concat('build.min.js'))
    .pipe(rev())
    .pipe(gulp.dest('./build'));

});

// inject reference to production JS build into index.html
gulp.task('inject-js', function(){
  var inject = require('gulp-inject');
  var injectSrc = gulp.src(['./build/*.min.js'], {read: false});

  return gulp.src('./build/index.html')
    .pipe(inject(injectSrc))
    .pipe(gulp.dest('./build'));
});

// development injection of static assets
gulp.task('inject', function(){
    var wiredep = require('wiredep').stream;
    var inject = require('gulp-inject');

    var injectSrc = gulp.src(['./static/css/*.css',
                             './static/js/*.js'], {read: false});
    var injectOptions = {
        ignorePath: '/static'
    };

    var options = {
        bowerJson: require('./bower.json'),
        directory: './static/lib'
    };

    return gulp.src('./index.html')
        .pipe(wiredep(options))
        .pipe(inject(injectSrc, injectOptions))
        .pipe(gulp.dest('./'));

});
