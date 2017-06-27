(function () {
    'use strict';

    /*var trip = {
        "GeoHazardID": 10,
        "ObserverGuid": "3ec84df5-226f-4578-b28e-39a9773c4af4",
        "TripTypeID": "30",
        "ObservationExpectedMinutes": 780,
        "Comment": "",
        "DeviceGuid": "24ad5391-9865-4306-0677-5e72c2c31bc5",
        "Lat": "59,9291293",
        "Lng": "10,7080138"
    };*/

    function Trip($http, AppSettings, Utility, User, ObsLocation, RegobsPopup, LocalStorage, UserLocation, $state, $rootScope, Registration) {
        'ngInject';

        var Trip = this;
        var storageKey = 'regobsTrip';
        var defaultModel = {
            started: false,
            time: null,
            data: {}
        };

        Trip.model = LocalStorage.getAndSetObject(
            storageKey, 'data', angular.copy(defaultModel)
        );

        Trip._getTripLocation = function () {
            if (ObsLocation.isSet()) {
                return {
                    latitude: ObsLocation.data.Latitude,
                    longitude: ObsLocation.data.Longitude
                };
            } else if (UserLocation.hasUserLocation()) {
                return UserLocation.getLastUserLocation();
            }
            return null;
        };

        Trip.canStart = function () {
            return AppSettings.getAppMode() === 'snow' && !Trip.model.started && !User.getUser().anonymous;
        };


        Trip.start = function (type, tripId, expectedMin, comment, cancelPromise) {
            if (User.getUser().anonymous) {
                return RegobsPopup.alert('NOT_LOGGED_IN', 'NOT_LOGGED_IN_TRIP_MESSAGE');
            }
            if (!(tripId && expectedMin)) {
                return RegobsPopup.alert('PLEASE_FILL_FORM', 'PLEASE_FILL_FORM_MESSAGE');
            }
            var loc = Trip._getTripLocation();
            if (loc) {
                Trip.model.time = new Date();
                Trip.model.started = false;
                Trip.model.data = {
                    "GeoHazardID": Utility.geoHazardTid(type),
                    "ObserverGuid": User.getUser().Guid,
                    "TripTypeID": tripId,
                    "ObservationExpectedMinutes": expectedMin,
                    "Comment": comment,
                    "DeviceGuid": Utility.createGuid(),
                    "Lat": loc.latitude,
                    "Lng": loc.longitude
                };
                save();

                var settings = angular.copy(AppSettings.httpConfig);
                if (cancelPromise) {
                    settings.timeout = cancelPromise.promise;
                }

                Trip.sending = true;
                $rootScope.$broadcast('$regobs.tripSending');
                return $http.post(AppSettings.getEndPoints().trip, Trip.model.data, settings)
                    .then(function () {
                            Trip.model.started = true;
                            save();
                            $rootScope.$broadcast('$regobs.tripStarted');
                    })
                    .catch(function (httpResponse) {
                        if (httpResponse.status !== 0) {
                            RegobsPopup.alert('ERROR', 'TRIP_ERROR_MESSAGE');
                        }
                        Trip.model.started = false;
                        save();
                    })
                    .finally(function () {
                        Trip.sending = false;
                    });
            } else {
                return RegobsPopup.alert('NO_POSITION', 'NO_TRIP_POSITION');
            }
        };

        Trip.stop = function () {
            return RegobsPopup.confirm('CONFIRM_SEND', 'STOP_TRIP')
                .then(function (confirm) {
                    if (confirm) {
                        Trip.sending = true;
                        $rootScope.$broadcast('$regobs.tripSending');
                        return $http.put(AppSettings.getEndPoints().trip, Trip.model.data, AppSettings.httpConfig);
                    }
                })
                .then(function (httpPromise) {
                    if (httpPromise) {
                        stop();
                        return RegobsPopup.alert('TRIP_STOPPED', 'TRIP_STOPPED_TEXT');
                    }
                })
                .catch(function () {
                    RegobsPopup.alert('ERROR', 'STOP_TRIP_ERROR_TEXT');
                    stop();
                })
                .finally(function () {
                    Trip.sending = false;
                });

        };

        Trip.checkIfTripShouldBeAutoStopped = function () {
            if (!Trip.model.time) {
                return;
            }
            var now = new Date();
            var modelTime = new Date(Trip.model.time);

            if (Trip.model.time && now.getDay() !== modelTime.getDay()) {
                stop();
                return RegobsPopup.alert('TRIP_STOPPED', 'TRIP_AUTO_STOPPED');
            }
        };

        function stop() {
            Trip.model = angular.copy(defaultModel);
            save();
            Trip.sending = false;
            $rootScope.$broadcast('$regobs.tripStopped');
        }

        function save() {
            LocalStorage.setObject(storageKey, Trip.model);
        }

        return Trip;

    }

    angular.module('RegObs')
        .factory('Trip', Trip);

})();
