angular
    .module('RegObs')
    .factory('AppLogging', function (AppSettings, $log) {
        var logging = this;
        var origDebug = $log.debug;
        var origLog = $log.log;
        var origError = $log.error;
        var origWarn = $log.warn;
        var origInfo = $log.info;

        var isTest = function () {
            return AppSettings.data.env === 'test regObs';
        };

        logging.debug = function () {
            if (isTest())
                origDebug.apply(null, arguments);
        };

        logging.log = function () {
            if (isTest())
                origLog.apply(null, arguments);
        };

        logging.error = function () {
            if (isTest())
                origError.apply(null, arguments);
        };

        logging.warn = function () {
            if (isTest())
                origWarn.apply(null, arguments);
        };

        logging.info = function () {
            if (isTest())
                origInfo.apply(null, arguments);
        };

        return logging;
    });