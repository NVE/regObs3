angular
    .module('RegObs')
    .factory('ObsLocation', function ObsLocation($http, $ionicPlatform, $cordovaGeolocation, AppSettings, LocalStorage) {
        var ObsLocation = this;
        var storageKey = 'regobsLocation';

        function init(){
            ObsLocation.fetching = false;
            ObsLocation.data = LocalStorage.getObject(storageKey);
            ObsLocation.source = {
                clickedInMap: 35,
                fetchedFromGPS: 40,
                storedPosition: 45
            };
            if(!ObsLocation.isSet()){
                ObsLocation.data = {};
                save();
            }
            console.log(ObsLocation.data);
        }

        ObsLocation.isSet = function(){
            return ObsLocation.data && (ObsLocation.data.Latitude || ObsLocation.data.ObsLocationId);
        };

        ObsLocation.fetchPosition = function () {
            console.log('fetchPosition called');
            ObsLocation.fetching = true;
            return $ionicPlatform.ready(function(){
            return $cordovaGeolocation
                .getCurrentPosition({
                    timeout: !isNaN(AppSettings.data.gpsTimeout)?(AppSettings.data.gpsTimeout*1000):10000,
                    enableHighAccuracy: true,
                    maximumAge: 3000
                })
                .then(success, error);
              });

            function success (position) {
                ObsLocation.fetching = false;
                console.log('Got position:',position);
                ObsLocation.set({
                    "Latitude": position.coords.latitude.toFixed(4),
                    "Longitude": position.coords.longitude.toFixed(4),
                    "Uncertainty": parseInt(position.coords.accuracy).toString(),
                    "UTMSourceTID": ObsLocation.source.fetchedFromGPS
                });
                return true;
            }

            function error(err) {
                ObsLocation.fetching = false;
                // error
                console.log('ObsLocation error',err);
                return err;
            }
        };

        ObsLocation.getObservationsWithinRadius = function(range, geohazardId){
            return $http.get(
                AppSettings.getEndPoints().getObservationsWithinRadius, {
                    params: {
                        latitude:ObsLocation.data.Latitude,
                        longitude:ObsLocation.data.Longitude,
                        range:range,
                        geohazardId: geohazardId
                    },
                    timeout: AppSettings.data.gpsTimeout*1000
                });
        };

        ObsLocation.get = function(){
            return ObsLocation.data;
        };

        ObsLocation.set = function(loc){
            if(loc){
                ObsLocation.data = loc;
                getLocationName(loc);
                save();
            }
        };

        ObsLocation.setPreviousUsedPlace = function(id, name){
            if(id){
                ObsLocation.data.ObsLocationId = id;
                ObsLocation.data.Name = name;
                save();
            }
        };

        function getLocationName(loc){
            if(!loc.Latitude) return;

            ObsLocation.data.place = undefined;

            $http.get(AppSettings.getEndPoints().getLocationName, {
                params: {
                    latitude:loc.Latitude,
                    longitude:loc.Longitude
                },
                timeout: AppSettings.data.gpsTimeout*1000
            }).then(function(response){
                console.log(response);
                ObsLocation.data.place = response.data.Data;
                save();
            });
        }

        function save(){
            LocalStorage.setObject(storageKey, ObsLocation.data);
        }

        init();

        return ObsLocation;
    });
