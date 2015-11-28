angular
    .module('RegObs')
    .factory('ObsLocation', function ObsLocation(AppSettings, $ionicPlatform, $cordovaGeolocation) {
        var ObsLocation = this;
        var position;

        ObsLocation.fetching = false;

        ObsLocation.fetchPosition = function () {
            ObsLocation.fetching = true;
            position = undefined;
            return $cordovaGeolocation
                .getCurrentPosition({
                    timeout: !isNaN(AppSettings.data.gpsTimeout)?AppSettings.data.gpsTimeout*1000:10000,
                    enableHighAccuracy: true
                })
                .then(success, error);
        };

        ObsLocation.get = function () {
            if (position)
                return {
                    "Latitude": position.coords.latitude.toString(),
                    "Longitude": position.coords.longitude.toString(),
                    "Uncertainty": position.coords.accuracy.toString(),
                    "UTMSourceTID": 40
                };

            return {};
        };

        function success (pos) {
            ObsLocation.fetching = false;
            console.log('Got position:',pos);
            position = pos;
            return pos;
        }

        function error(err) {
            // error
            ObsLocation.fetching = false;
            console.error(err);
            return err;
        }

        return ObsLocation;
    });