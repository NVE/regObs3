angular
    .module('RegObs')
    .factory('Observations', function ($http, AppSettings, LocalStorage, AppLogging, Utility, $q) {
        var service = this;
        var storageKey = 'regobsObservations';

        service.observations = [];

        var getValidObservationsFromLocalStorage = function () {
            var validObservations = [];
            var observations = JSON.parse(LocalStorage.get(storageKey, "[]"));

            var nowts = new Date().getTime();
            var validTime = (AppSettings.data.obsvalidtime || (7 * 24 * 60 * 60)) * 1000; //Valid time in ms
            observations.forEach(function (obs) {
                var timestamp = obs.timestamp;
                if (nowts - timestamp < validTime) {
                    validObservations.push(obs);
                }
            });
            service.observations = validObservations;
            service.save();
            return service.observations;
        };

        service.save = function() {
            LocalStorage.setObject(storageKey, service.observations);
        };

        var observationExists = function(id) {
            return service.observations.filter(function(value) {
                return value.LocationId === id;
            }).length > 0;
        };

        service.updateObservationsWithinRadius = function (latitude, longitude, range, geohazardId) {
            return $q(function(resolve, reject) {
                $http.get(
                        AppSettings.getEndPoints().getObservationsWithinRadius,
                        {
                            params: {
                                latitude: latitude,
                                longitude: longitude,
                                range: range,
                                geohazardId: geohazardId
                            },
                            timeout: AppSettings.httpConfig.timeout
                        })
                    .then(function(result) {
                            AppLogging.log('Observations: ' + JSON.stringify(result));
                            var timestamp = new Date().getTime();
                            if (result.data && result.data.Data) {
                                var data = JSON.parse(result.data.Data);
                                if (data.data) {
                                    data.data.forEach(function(obs) {
                                        obs.timestamp = timestamp;
                                        if (!observationExists(obs.LocationId)) {
                                            service.observations.push(obs);
                                        }
                                    });
                                    service.save();
                                }
                            }

                            resolve(service.observations);
                        },
                        reject);
            });
        };

        var init = function() {
            getValidObservationsFromLocalStorage();
        };

        init();

        return service;
    });