angular
    .module('RegObs')
    .controller('SnowGeneralObsCtrl', function ($scope, Utility, Registration) {
        function init() {
            var vm = this;
            vm.generalObservation = Registration.getPropertyAsObject('GeneralObservation');
            vm.save = Registration.save;
        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
