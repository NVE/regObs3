angular
    .module('RegObs')
    .controller('IceGeneralObsCtrl', function ($scope, Utility, Registration) {
        function init() {
            var vm = this;
            vm.generalObservation = Registration.getPropertyAsObject('GeneralObservation');
            vm.save = Registration.save;
        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
