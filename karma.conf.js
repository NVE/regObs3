// Karma configuration
// Generated on Fri Dec 09 2016 14:13:55 GMT+0100 (W. Europe Standard Time)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            { pattern: 'www/lib/ga-localstorage/GALocalStorage.js', included: true },
            { pattern: 'www/lib/leaflet/dist/leaflet.js', included: true },
            { pattern: 'www/lib/moment/min/moment.min.js', included: true },
            { pattern: 'www/lib/progressbar.js/dist/progressbar.min.js', included: true },
            { pattern: 'www/lib/Leaflet.awesome-markers/dist/leaflet.awesome-markers.js', included: true },
            { pattern: 'www/lib/leaflet.markercluster/dist/leaflet.markercluster.js', included: true },
            { pattern: 'www/lib/ionic/js/ionic.min.js', included: true },
            { pattern: 'www/lib/angular/angular.min.js', included: true },
            { pattern: 'www/lib/angular-mocks/angular-mocks.js', included: true },
            { pattern: 'www/lib/angular-animate/angular-animate.min.js', included: true },
            { pattern: 'www/lib/angular-sanitize/angular-sanitize.min.js', included: true },
            { pattern: 'www/lib/angular-ui-router/release/angular-ui-router.min.js', included: true },
            { pattern: 'www/lib/angular-progressbar/dist/angular-progressbar.min.js', included: true },
            { pattern: 'www/lib/angular-translate/angular-translate.min.js', included: true },
            { pattern: 'www/lib/angular-translate-loader-static-files/angular-translate-loader-static-files.js', included: true },
            { pattern: 'www/lib/ionic/js/ionic-angular.min.js', included: true },
            { pattern: 'www/lib/ngCordova/dist/ng-cordova.min.js', included: true },
            { pattern: 'www/lib/ion-floating-menu/dist/ion-floating-menu.min.js', included: true },
            { pattern: 'www/lib/ng-webworker/src/ng-webworker.min.js', included: true },
            { pattern: 'www/app/app.js', included: true },
            { pattern: 'www/app/AppCtrl.js', included: true },
            { pattern: 'www/app/**/*.js', included: true },
            { pattern: 'tests/unittests/**/*.js', included: true }
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'www/app/**/*.js': 'coverage'
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        coverageReporter: {
            type: 'html',
            dir: 'coverage/'
        },

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
}
