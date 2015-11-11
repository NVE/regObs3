angular
    .module('RegObs')
    .controller('IceIncidentCtrl', function ($scope) {
        function init() {
            var vm = this;

        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
