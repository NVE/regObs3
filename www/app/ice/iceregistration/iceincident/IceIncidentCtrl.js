angular
    .module('RegObs')
    .controller('IceIncidentCtrl', function ($scope) {
        function init() {
            var vm = this;
            vm.registrationProp = 'Incident';

        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
