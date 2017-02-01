angular
    .module('RegObs')
    .factory('ObsLocation', function ($http, $ionicPlatform, $cordovaGeolocation, AppSettings, LocalStorage, AppLogging, $rootScope, UserLocation) {
        var ObsLocation = this;
        var storageKey = 'regobsLocation';

        function init() {
            ObsLocation.fetching = false;
            ObsLocation.data = LocalStorage.getObject(storageKey);
            ObsLocation.source = {
                clickedInMap: 35,
                fetchedFromGPS: 40,
                storedPosition: 45
            };
            if (!ObsLocation.isSet()) {
                ObsLocation.data = {};
                save();
            }
            AppLogging.log(ObsLocation.data);
        }

        ObsLocation.isSet = function () {
            return ObsLocation.data && (ObsLocation.data.Latitude || ObsLocation.data.ObsLocationId);
        };

        ObsLocation.remove = function () {
            ObsLocation.data = {};
            save();
        };

        //ObsLocation.fetchGPSPosition = function (success, error) {
        //    var timeout = parseInt(AppSettings.data.gpsTimeout);

        //    return $ionicPlatform.ready(function () {
        //        return $cordovaGeolocation
        //            .getCurrentPosition({
        //                timeout: timeout ? (timeout * 1000) : 10000,
        //                enableHighAccuracy: true,
        //                maximumAge: 3000
        //            })
        //            .then(success, error);
        //    });
        //};

        //ObsLocation.fetchAndSetPosition = function () {
        //    AppLogging.log('fetchAndSetPosition called');
        //    ObsLocation.fetching = true;
        //    //var timeout = parseInt(AppSettings.data.gpsTimeout);

        //    //return $ionicPlatform.ready(function(){
        //    //    return $cordovaGeolocation
        //    //        .getCurrentPosition({
        //    //            timeout: timeout?(timeout*1000):10000,
        //    //            enableHighAccuracy: true,
        //    //            maximumAge: 3000
        //    //        })
        //    //        .then(success, error);
        //    //});
        //    ObsLocation.fetchGPSPosition(success, error);

        //    function success (position) {
        //        ObsLocation.fetching = false;
        //        AppLogging.log('Got position:', position);
        //        ObsLocation.set({
        //            "Latitude": position.coords.latitude.toFixed(4),
        //            "Longitude": position.coords.longitude.toFixed(4),
        //            "Uncertainty": parseInt(position.coords.accuracy).toString(),
        //            "UTMSourceTID": ObsLocation.source.fetchedFromGPS
        //        });
        //        return true;
        //    }

        //    function error(err) {
        //        ObsLocation.fetching = false;
        //        // error
        //        AppLogging.log('ObsLocation error', err);
        //        return err;
        //    }
        //};

        //ObsLocation.getObservationsWithinRadius = function (range, geohazardId) {
        //    return $http.get(
        //        AppSettings.getEndPoints().getObservationsWithinRadius, {
        //            params: {
        //                latitude: ObsLocation.data.Latitude,
        //                longitude: ObsLocation.data.Longitude,
        //                range: range,
        //                geohazardId: geohazardId
        //            },
        //            timeout: AppSettings.data.gpsTimeout * 1000
        //        });
        //};

        ObsLocation.get = function () {
            return ObsLocation.data;
        };

        ObsLocation.set = function (loc) {
            if (loc && loc.Latitude) {
                ObsLocation.data = {
                    Latitude: loc.Latitude.toString(),
                    Longitude: loc.Longitude.toString(),
                    Uncertainty: loc.Uncertainty.toString(),
                    UTMSourceTID: loc.UTMSourceTID
                };

                getLocationName(ObsLocation.data);
                save();


            }
        };

        ObsLocation.setPreviousUsedPlace = function (id, name, loc) {
            if (id) {
                ObsLocation.data.ObsLocationId = id;
                ObsLocation.data.Name = name;

                if (loc) {
                    ObsLocation.data.Latitude = loc.Latitude;
                    ObsLocation.data.Longitude = loc.Longitude;
                    ObsLocation.data.Uncertainty = loc.Uncertainty;
                    ObsLocation.data.UTMSourceTID = loc.UTMSourceTID;
                }

                save();
            }
        };

        ObsLocation.setPositionToCurrentUserPosition = function() {
            if (UserLocation.hasUserLocation()) {
                var loc = UserLocation.getLastUserLocation();
                ObsLocation.set({ Latitude: loc.latitude.toString(), Longitude: loc.longitude.toString(), Uncertainty: loc.accuracy.toString(), UTMSourceTID: ObsLocation.source.fetchedFromGPS });
            }
        };

        function getLocationName(loc) {
            if (!loc.Latitude) return;

            ObsLocation.data.place = undefined;

            $http.get(AppSettings.getEndPoints().getLocationName, {
                params: {
                    latitude: loc.Latitude,
                    longitude: loc.Longitude
                },
                timeout: AppSettings.data.gpsTimeout * 1000
            }).then(function (response) {
                AppLogging.log(response);
                ObsLocation.data.place = response.data.Data;
                save();
            });
        }

        function save() {
            LocalStorage.setObject(storageKey, ObsLocation.data);
            $rootScope.$broadcast('$regObs:obsLocationSaved');
        }

        init();

        return ObsLocation;
    });
