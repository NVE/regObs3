angular
    .module('RegObs')
    .factory('ObsLocation', function ($http, $ionicPlatform, $cordovaGeolocation, AppSettings, LocalStorage, AppLogging, $rootScope, UserLocation, Utility) {
        var ObsLocation = this;
        var storageKey = 'regobsLocation';

        ObsLocation.init = function() {
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

        ObsLocation.getDescription = function () {
            if (ObsLocation.isSet()) {
                if (ObsLocation.data.ObsLocationId) {
                    return ObsLocation.data.Name;
                }
                if (ObsLocation.data.place) {
                    var arr = [];
                    if (ObsLocation.data.place.Navn) {
                        arr.push(ObsLocation.data.place.Navn);
                    }
                    if (ObsLocation.data.place.Fylke) {
                        arr.push(ObsLocation.data.place.Fylke);
                    }
                    return arr.join(' / ');
                }
                if (ObsLocation.data.Latitude && ObsLocation.data.Longitude) {
                    //return Utility.ddToDms(ObsLocation.data.Latitude, ObsLocation.data.Longitude);
                    return Utility.formatLatLng(ObsLocation.data.Latitude, ObsLocation.data.Longitude);
                }
            }
            return 'UNKNOWN_POSITION';
        };

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
                    longitude: loc.Longitude,
                    geoHazardId: Utility.getCurrentGeoHazardTid()
                },
                timeout: AppSettings.httpConfig.timeout
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

        ObsLocation.init();

        return ObsLocation;
    });
