var gulp = require('gulp');
var sass = require('gulp-sass');

var jsFiles = ['*.js', 'src/**/*.js'];

gulp.task('default', ['sass:watch']);

gulp.task('sass', function () {
  return gulp.src('./static/sass/main.scss')
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
        ignorePath: '/static'
    };
    
    var options = {
        bowerJson: require('./static/bower.json'),
        directory: './static/lib'
    };
    
    return gulp.src('./index.html')
        .pipe(wiredep(options))
        .pipe(inject(injectSrc, injectOptions))
        .pipe(gulp.dest('./'));
        
});