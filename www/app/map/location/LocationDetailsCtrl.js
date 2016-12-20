angular
    .module('RegObs')
    .controller('LocationDetailsCtrl', function ($stateParams, Map, AppSettings, $translate, Registration, ObsLocation) {
        var vm = this;
        vm.location = $stateParams.location;

        $translate(AppSettings.getAppMode().toUpperCase())
            .then(function (geoHazardName) {
                vm.geoHazardName = geoHazardName.toLowerCase();
            });


        var distance = Map.getUserDistanceFrom(vm.location.LatLngObject.Latitude, vm.location.LatLngObject.Longitude);
        if (distance.distance) {
            vm.distance = distance.description;
        }

        vm.startNewRegistration = function() {
            var obsLoc = {
                Latitude: vm.location.LatLngObject.Latitude.toString(),
                Longitude: vm.location.LatLngObject.Longitude.toString(),
                Uncertainty: '0',
                UTMSourceTID: ObsLocation.source.storedPosition
            };
            ObsLocation.setPreviousUsedPlace(vm.location.LocationId, vm.location.Name, obsLoc);
            Registration.createAndGoToNewRegistration();
        };
    });