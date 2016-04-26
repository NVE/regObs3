angular
    .module('RegObs')
    .controller('SnowDangerObsCtrl', function SnowDangerObsCtrl($scope) {

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


    });
