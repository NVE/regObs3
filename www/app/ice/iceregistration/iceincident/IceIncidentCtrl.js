angular
    .module('RegObs')
    .controller('IceIncidentCtrl', function ($scope, Utility, Registration) {
        function init() {
            var vm = this;

            vm.save = Registration.save;

            vm.incident = Registration.getPropertyAsObject('ice', 'Incident');

        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
