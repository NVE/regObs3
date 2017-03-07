angular.module('RegObs').factory('DateHelpers', function (moment) {
    var service = this;

    service.now = function () {
        return moment();
    };

    return service;
});