var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('default', ['sass:watch']);

gulp.task('sass', function () {
  return gulp.src('./static/sass/styles.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./static/css'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./static/sass/**/*.scss', ['sass', 'inject']);
});

gulp.task('inject', function(){
    var wiredep = require('wiredep').stream;
    var inject = require('gulp-inject');

    var injectSrc = gulp.src(['./static/css/*.css',
                             './static/js/*.js'], {read: false});
    var injectOptions = {
        addRootSlash: false
    };

    var options = {
        bowerJson: require('./bower.json'),
        directory: './static/lib',
        ignorePath: '../../static'
    };

    return gulp.src('./index.html')
        .pipe(wiredep(options))
        .pipe(inject(injectSrc, injectOptions))
        .pipe(gulp.dest('./'));

});
