angular
    .module('RegObs')
    .controller('DirtDangerObsCtrl', function DirtDangerObsCtrl($scope, $ionicModal, $ionicPopup, Utility, Registration) {

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


        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );

    });
