angular
    .module('RegObs')
    .controller('IceCoverObsCtrl', function ($scope, Utility, Registration) {
        function init(){
            var vm = this;

            vm.save = Registration.save;

            vm.iceCoverObs = Registration.getPropertyAsObject('ice', 'IceCoverObs');

        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );
    });
/*
"IceCoverObs": {
    "IceCoverTID": "3",
        "IceCoverBeforeTID": "10",
        "IceCapacityTID": "20",
        "IceSkateabilityTID": "40",
        "Comment": "Kommentar"
}*/
