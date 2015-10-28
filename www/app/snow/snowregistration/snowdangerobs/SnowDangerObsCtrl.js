angular
    .module('RegObs')
    .controller('SnowDangerObsCtrl', function SnowDangerObsCtrl($scope, Registration) {

        function init() {
            var vm = this;

            vm.areaArray = [
                "Ikke gitt",
                "På dette stedet",
                "I denne fjellsiden",
                "Generelt på fjellet",
                "I dalen/fjorden",
                "For kommunen",
                "Fylket/varslingsregion"
            ];

            vm.dangerObsArray = Registration.getPropertyAsArray('snow', 'DangerObs');

        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );

    });
