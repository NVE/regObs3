angular
    .module('RegObs')
    .controller('GeneralObsCtrl', function ($scope, Registration) {
        function init() {
            var vm = this;
            vm.registrationProp = 'GeneralObservation';
            vm.obs = Registration.getPropertyAsObject(vm.registrationProp);
        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
