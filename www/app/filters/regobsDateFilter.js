angular.module('RegObs')
    .filter('regobsDate', function (Utility) {
        return function (input, showTime) {
            if (showTime === undefined || showTime === true) {
                return Utility.formatDateAndTime(input);
            }
            return Utility.formatDate(input);
        };
    });