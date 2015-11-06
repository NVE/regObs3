angular
    .module('RegObs')
    .controller('IceIncidentCtrl', function ($scope, Utility, Registration) {
        function init() {
            var vm = this;
            vm.registrationProp = 'Incident';
            vm.incident = Registration.getPropertyAsObject(vm.registrationProp);

        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
