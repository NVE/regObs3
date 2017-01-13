angular.module('RegObs').factory('moment', function () {
    if (!moment) throw new Error('MomentJS library missing!');
    return moment;
});