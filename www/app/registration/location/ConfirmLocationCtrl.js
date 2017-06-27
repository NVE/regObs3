angular
    .module('RegObs')
    .controller('ConfirmLocationCtrl', function (ObsLocation, UserLocation, $state, $ionicHistory) {
        var vm = this;

        vm._getStartPosition = function () {
            if (ObsLocation.isSet()) {
                var location = ObsLocation.get();
                return location;
            }
            return null;
        };

        vm._navigate = function () {
            var backView = $ionicHistory.backView();
            if (backView && backView.stateId === 'newregistration') {
                $ionicHistory.goBack();
            } else {
                $state.go('confirmtime');
            }
        };

        vm.obsLocation = vm._getStartPosition();

        vm.savePosition = function (obsLoc, place) {          
            if (place) {
                ObsLocation.setPreviousUsedPlace(place.Id, place.Name, obsLoc);
            } else {
                ObsLocation.set(obsLoc);
            }
            vm._navigate();
        };

    });
