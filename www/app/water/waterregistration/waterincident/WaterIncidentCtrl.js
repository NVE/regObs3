angular
    .module('RegObs')
    .controller('WaterIncidentCtrl', function ($scope) {
        function init() {
            var vm = this;
            vm.registrationProp = 'Incident';

        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
