angular
    .module('RegObs')
    .controller('WaterDangerObsCtrl', function WaterangerObsCtrl($scope) {

        var vm = this;
        vm.areaArray = [
            "På dette stedet",
            "I denne fjellsiden",
            "Generelt på fjellet",
            "I dalen/fjorden",
            "For kommunen",
            "Fylket/varslingsregion"
        ];

        $scope.$on( '$ionicView.loaded', function(){} );

    });
