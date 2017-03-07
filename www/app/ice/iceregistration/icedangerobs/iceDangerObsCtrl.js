angular
    .module('RegObs')
    .controller('IceDangerObsCtrl', function IceDangerObsCtrl($scope) {

        var vm = this;

        vm.areaArray = [
            "Akkurat her",
            "På denne siden av vannet",
            "På dette vannet",
            "Mange vann i nærheten"
        ];

        $scope.$on( '$ionicView.loaded', function(){} );

    });
