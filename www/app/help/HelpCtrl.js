angular
    .module('RegObs')
    .controller('HelpCtrl', function ($scope, $ionicHistory, AppLogging, $stateParams, HelpTexts, AppSettings, Utility) {
        var vm = this;

        if ($stateParams.registrationProp) {
            var tid = Utility.registrationTid($stateParams.registrationProp);
            if (tid) {
                HelpTexts.getHelpText(tid, Utility.getCurrentGeoHazardTid()).then(function (result) {
                    vm.helpText = result;
                });
            };
        }
    });