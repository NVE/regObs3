angular
    .module('RegObs')
    .controller('IceDangerObsCtrl', function IceDangerObsCtrl($scope) {

        function init() {
            var vm = this;

            vm.areaArray = [
                "Ikke gitt",
                "Akkurat her",
                "På denne siden av vannet",
                "På dette vannet",
                "Mange vann i nærheten"
            ];


        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );

    });
