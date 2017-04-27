angular
    .module('RegObs')
    .controller('DamageObsPositionCtrl', function ($scope, $state, Registration, UserLocation, $stateParams, $ionicHistory) {
        var vm = this;

        vm.damageObs = $stateParams.damageObs;

        vm._getStartPosition = function () {
            if (vm.damageObs.DamagePosition) {
                return vm.damageObs.DamagePosition;
            }
            if (UserLocation.hasUserLocation()) {
                var lastPosition = UserLocation.getLastUserLocation();
                return { Latitude: lastPosition.latitude, Longitude: lastPosition.longitude };
            }
            return null;
        };

        vm.startposition = vm._getStartPosition();

        vm.save = function (pos) {          
            vm.damageObs.DamagePosition = pos;
            $ionicHistory.goBack();
        }; 
    });