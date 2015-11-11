angular
    .module('RegObs')
    .controller('WaterIncidentCtrl', function ($scope) {
        function init() {
            var vm = this;

        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
