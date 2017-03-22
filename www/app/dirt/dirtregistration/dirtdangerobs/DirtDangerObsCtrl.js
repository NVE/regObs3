angular
    .module('RegObs')
    .controller('DirtDangerObsCtrl', function DirtDangerObsCtrl($scope, $ionicModal, $ionicPopup, Utility, Registration) {

        var vm = this;
        vm.areaArray = [
            "På dette stedet",
            "I denne fjellsiden",
            "Generelt på fjellet",
            "I dalen/fjorden",
            "For kommunen",
            "Fylket/varslingsregion"
        ];



    });
