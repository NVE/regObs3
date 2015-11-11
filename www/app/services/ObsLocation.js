angular
    .module('RegObs')
    .factory('ObsLocation', function ObsLocation($ionicPlatform, $cordovaGeolocation) {
        var ObsLocation = this;
        var position;
        var options = {timeout: 10000, enableHighAccuracy: true};

        ObsLocation.fetchPosition = function () {
            return $cordovaGeolocation
                .getCurrentPosition(options)
                .then(success, error);
        };

        ObsLocation.get = function () {
            if (position)
                return {
                    "Latitude": position.coords.latitude.toString(),
                    "Longitude": position.coords.longitude.toString(),
                    "Uncertainty": position.coords.accuracy.toString(),
                    "UTMSourceTID": "35"
                };
        };

        $ionicPlatform.ready(function(){
            ObsLocation.fetchPosition();
        });

        function success (pos) {
            console.log('Got position:',pos);
            position = pos;
        }

        function error(err) {
            // error
            console.error(err);
            return err;
        }

        return ObsLocation;
    });