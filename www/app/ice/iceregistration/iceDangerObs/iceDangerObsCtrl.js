angular
    .module('RegObs')
    .controller('IceDangerObsCtrl', function IceDangerObsCtrl($scope, $ionicModal, $ionicPopup, Utility, Registration) {

        function init() {
            var vm = this;

            vm.areaArray = [
                "Ikke gitt",
                "Akkurat her",
                "På denne siden av vannet",
                "På dette vannet",
                "Mange vann i nærheten"
            ];

            vm.dangerObsArray = Registration.getPropertyAsArray('ice', 'DangerObs');

        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );

    });