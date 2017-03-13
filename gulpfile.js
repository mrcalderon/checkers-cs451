var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var uglify = require('gulp-uglify');
var pump = require('pump');

var jsFiles = ['*.js', 'public/*.js'];

gulp.task('style', function() {
    return gulp.src(jsFiles)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jscs());
});

gulp.task('compress', function (cb) {
    pump([
            gulp.src(jsFiles),
            uglify(),
            gulp.dest('dist')
        ],
        cb
    );
});

gulp.task('default', function() {
    console.log('test');
});
