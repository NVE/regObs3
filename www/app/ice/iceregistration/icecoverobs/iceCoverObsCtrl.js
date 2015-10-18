angular
    .module('RegObs')
    .controller('IceCoverObsCtrl', function ($scope, Registration, IceRegistration) {
        function init(){
            var vm = this;

            var loadKdvArrays = function () {
                return Registration
                    .getKdvRepositories()
                    .then(function (KdvRepos) {
                        vm.kdvArrays = {
                            iceCover: KdvRepos.Ice_IceCoverKDV,
                            iceCoverBefore: KdvRepos.Ice_IceCoverBeforeKDV,
                            iceCoverCapacity: KdvRepos.Ice_IceCapacityKDV,
                            iceCoverSkateability: KdvRepos.Ice_IceSkateabilityKDV
                        };
                        vm.iceCoverObs.IceCoverTID = vm.iceCoverObs.IceCoverTID || vm.kdvArrays.iceCover[0].Id;
                        vm.iceCoverObs.IceCoverBeforeTID = vm.iceCoverObs.IceCoverBeforeTID || vm.kdvArrays.iceCoverBefore[0].Id;
                        vm.iceCoverObs.IceCapacityTID = vm.iceCoverObs.IceCapacityTID || vm.kdvArrays.iceCoverCapacity[0].Id;
                        vm.iceCoverObs.IceSkateabilityTID = vm.iceCoverObs.IceSkateabilityTID || vm.kdvArrays.iceCoverSkateability[0].Id;
                    })
            };

            vm.iceCoverObs = Registration.getPropertyAsObject(IceRegistration.registration, 'IceCoverObs');
            loadKdvArrays();

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
