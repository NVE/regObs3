angular
    .module('RegObs')
    .controller('DamageObsPositionCtrl', function ($scope, $state, Registration, UserLocation, $stateParams, $ionicHistory, ObsLocation) {
        var vm = this;

        vm.damageObs = $stateParams.damageObs;

        vm.damageMarker = L.AwesomeMarkers.icon({
            icon: 'ios-bolt-outline',
            prefix: 'ion',
            markerColor: 'blue',
            extraClasses: 'large-map-icon'
        });
        vm._getStartPosition = function () {
            if (vm.damageObs.DamagePosition) {
                return vm.damageObs.DamagePosition;
            }
            if (ObsLocation.isSet()) {
                var obsLocation = ObsLocation.get();
                return { Latitude: obsLocation.Latitude, Longitude: obsLocation.Longitude };
            }
            if (UserLocation.hasUserLocation()) {
                var lastPosition = UserLocation.getLastUserLocation();
                return { Latitude: lastPosition.latitude, Longitude: lastPosition.longitude };
            }
            return null;
        };

        vm._getExtraMarksers = function () {
            var markers = [];
            if (Registration.data.DamageObs && angular.isArray(Registration.data.DamageObs)) {
                Registration.data.DamageObs.forEach(function (item) {
                    if (item.DamageTypeTID !== vm.damageObs.DamageTypeTID && item.DamagePosition && item.DamagePosition.Latitude && item.DamagePosition.Longitude) {
                        markers.push(L.marker(L.latLng(item.DamagePosition.Latitude, item.DamagePosition.Longitude), { icon: vm.damageMarker }));
                    }
                });
            }
            return markers;
        };

        vm.obsLocation = ObsLocation.get();
        vm.fromPosition = vm.obsLocation ? L.latLng(vm.obsLocation.Latitude, vm.obsLocation.Longitude) : null;
        vm.extraMarkers = vm._getExtraMarksers();

        vm.startposition = vm._getStartPosition();

        vm.save = function (pos) {          
            vm.damageObs.DamagePosition = pos;
            $ionicHistory.goBack();
        }; 
    });