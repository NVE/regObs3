/// <binding ProjectOpened='watch' />
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
var preen = require('preen');
var jsonfile = require('jsonfile');
var Server = require('karma').Server;
var version = require('gulp-cordova-version');

var paths = {
    sass: ['./scss/ionic.app.scss', './www/app/**/*.scss'],
    js:   ['./www/app/app.js', './www/app/AppCtrl.js', './www/app/**/*.js'],
    dist: './www/dist/'
};

gulp.task('default', ['preen', 'sass', 'run-scripts-and-update-config']);

gulp.task('preen', function (cb) {
    preen.preen({}, cb);
});

gulp.task('test', function (done) {
    new Server({
        configFile: require('path').resolve('karma.conf.js'),
        singleRun: true
    }, function(err){
        if(err === 0){
            done();
        } else {
            done(new gutil.PluginError('karma', {
                message: 'Karma Tests failed'
            }));
        }
    }).start();
});

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

gulp.task('run-scripts-and-update-config', ['scripts'], function (done) {
    jsonfile.readFile('./www/app/json/version.json',
        function (err, obj) {
            var vfile = obj;
            var versionStripped = vfile.version.replace(/\./g, '');
            var buildStripped = vfile.build.replace(/\ /g, '');
            var androidVersion = versionStripped + buildStripped.substring(2, 8);
            gulp.src('.')
            .pipe(version(vfile.version, { androidVersionCode: androidVersion, iosBundleVersion: buildStripped }))
            .on('end', done);
        });   
});

gulp.task('scripts', function (done) {
    jsonfile.readFile('./package.json', function(err, obj) {

        var now = new Date();
        var build = `${now.getFullYear()} ${('0' + (now.getMonth() + 1)).slice(-2)} ${('0' + now.getDate()).slice(-2)} ${('0' + now.getHours()).slice(-2)}${('0' + now.getMinutes()).slice(-2)}${('0' + now.getSeconds()).slice(-2)}`;
        var vobj = {
            version: obj.version,
            build: build
        };
        jsonfile.writeFile('./www/app/json/version.json', vobj, function (err2) {
            console.error(err2);
        });
    });

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
    gulp.watch(paths.js, ['run-scripts-and-update-config']);
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
