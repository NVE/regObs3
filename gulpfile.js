var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var paths = {
    sass: ['./scss/ionic.app.scss', './www/app/**/*.scss'],
    js:   ['./www/app/app.js', './www/app/**/*.js'],
    dist: './www/dist/'
};

gulp.task('default', ['sass', 'scripts']);

gulp.task('sass', function(done) {
    gulp.src(paths.sass)
        .pipe(concat('app.scss'))
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(gulp.dest(paths.dist))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(paths.dist))
        .on('end', done);
});

gulp.task('scripts', function (done) {
    gulp.src(paths.js)
        .pipe(concat('app.js'))
        .pipe(gulp.dest(paths.dist))
        .pipe(rename({ suffix: '.min' }))
        //.pipe(stripDebug())
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist))
        .on('end', done);
});

gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.js, ['scripts']);
});

gulp.task('install', ['git-check'], function() {
    return bower.commands.install()
        .on('log', function(data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function(done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});
