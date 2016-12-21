angular
    .module('RegObs')
    .factory('Observations', function ($http, AppSettings, LocalStorage, AppLogging, Utility, $q) {
        var service = this;
        var storageKey = 'regobsObservations';
        var locationsStorageKey = 'regObsLocations';

        service.locations = [];

        service.observations = [
        {
            LocationName: 'Hedmark/FOLLDAL',
            LocationId: 123,
            GeoHazardTid: 10,
            Distance: 240,
            DateTime: new Date(),
            LatLngObject: { Latitude: 60.199, Longitude: 11.053 },
            ObserverNick: 'Test person',
            ObserverGroup: '',
            Registrations: [
                {
                    "RegistrationTid": 102035,
                    "RegistrationName": "7 Snø observasjoner ved (Hedmark/FOLLDAL)",
                    "TypicalValue1": "string",
                    "TypicalValue2": "string"
                },
                {
                    "RegistrationTid": 2,
                    "RegistrationName": "Reg 2",
                    "TypicalValue1": "string",
                    "TypicalValue2": "string"
                }
            ]
        },
        {
            LocationName: 'Observasjon 2',
            LocationId: 1234,
            GeoHazardTid: 70,
            Distance: 2040,
            DateTime: new Date(),
            LatLngObject: { Latitude: 60.210, Longitude: 11.150 },
            ObserverNick: 'Test person',
            ObserverGroup: '',
            Registrations: [
                {
                    "RegistrationTid": 3,
                    "RegistrationName": "Reg 3",
                    "TypicalValue1": "string",
                    "TypicalValue2": "string"
                },
                {
                    "RegistrationTid": 4,
                    "RegistrationName": "Reg 4",
                    "TypicalValue1": "string",
                    "TypicalValue2": "string"
                }
            ]
        }
        ];

        //var getValidObservationsFromLocalStorage = function () {
        //    var validObservations = [];
        //    var observations = JSON.parse(LocalStorage.get(storageKey, "[]"));

        //    var nowts = new Date().getTime();
        //    var validTime = (AppSettings.data.obsvalidtime || (7 * 24 * 60 * 60)) * 1000; //Valid time in ms
        //    observations.forEach(function (obs) {
        //        var timestamp = obs.timestamp;
        //        if (nowts - timestamp < validTime) {
        //            validObservations.push(obs);
        //        }
        //    });
        //    service.observations = validObservations;
        //    service.save();
        //    return service.observations;
        //};

        service.getStoredObservations = function (geoHazardId) {
            var items = service.observations;
            if (geoHazardId) {
                items = items.filter(function (item) { return item.GeoHazardTid === geoHazardId });
            }
            return items;
        };

        service.getRegistrationDetails = function (id) {
            return $q(function (resolve, reject) {
                //TODO: Search by geoHazardId
                $http.post(
                        AppSettings.getEndPoints().getRegistration,
                        {RegId: id},
                        AppSettings.httpConfig)
                    .then(function (result) {
                        if (result.data && result.data.length > 0) {                           
                            resolve(result.data[0]);
                        } else {
                            reject(new Error('Could not find json result data'));
                        }
                    })
                    .catch(reject);
            });
        };

        service.save = function () {
            // LocalStorage.setObject(storageKey, service.observations);

        };

        var observationExists = function (id) {
            return service.observations.filter(function (value) {
                return value.LocationId === id;
            }).length > 0;
        };

        service.getLocations = function (geoHazardId) {
            var locations = LocalStorage.getObject(locationsStorageKey, []);
            if (geoHazardId) {
                locations = locations.filter(function (item) { return item.geoHazardId === geoHazardId });
            }
            return locations;
        };

        service.getNearbyLocations = function (latitude, longitude, range, geohazardId, canceller) {
            return $q(function (resolve, reject) {
                $http.get(
                        AppSettings.getEndPoints().getObservationsWithinRadius,
                        {
                            params: {
                                latitude: latitude,
                                longitude: longitude,
                                range: range,
                                geohazardId: geohazardId
                            },
                            timeout: canceller ? canceller.promise : AppSettings.httpConfig.timeout
                        })
                    .then(function (result) {
                        AppLogging.log('Observations: ' + JSON.stringify(result));
                        if (result.data && result.data.Data) {
                            var data = JSON.parse(result.data.Data);
                            var existingLocations = service.getLocations();
                            data.data.forEach(function (location) {
                                location.geoHazardId = geohazardId; //Setting missing result propery geoHazardId
                                var existingLocation = existingLocations.filter(function (item) {
                                    return item.LocationId === location.LocationId;
                                });
                                if (existingLocation.length > 0) {
                                    existingLocation[0] = location; //Update existing location with latest result
                                } else {
                                    existingLocations.push(location);
                                }
                            });
                            LocalStorage.setObject(locationsStorageKey, existingLocations);
                            resolve();
                        } else {
                            reject('Could not get json result');
                        }
                    }).catch(reject);
            });
        };


        service.updateObservationsWithinRadius = function (latitude, longitude, range, geohazardId, canceller) {
            var canceled = false;
            if (canceller) {
                canceller.promise.then(function () { canceled = true; });
            }

            return $q(function (resolve, reject) {
                var doWork = function (i) {
                    AppLogging.log('DoWork ' +i);
                    if (canceled) {
                        AppLogging.log('updateObservationsWithinRadius canceled');
                        reject('Canceled');
                    } else {
                        if (i <= 0) {
                            resolve(service.observations);
                        } else {
                            i--;
                            setTimeout(function () {
                                doWork(i);
                            }, 100);
                        }
                    }
                };

                doWork(200);
            });
            //return $q(function(resolve, reject) {
            //    $http.get(
            //            AppSettings.getEndPoints().getObservationsWithinRadius,
            //            {
            //                params: {
            //                    latitude: latitude,
            //                    longitude: longitude,
            //                    range: range,
            //                    geohazardId: geohazardId
            //                },
            //                timeout: AppSettings.httpConfig.timeout
            //            })
            //        .then(function(result) {
            //                AppLogging.log('Observations: ' + JSON.stringify(result));
            //                var timestamp = new Date().getTime();
            //                if (result.data && result.data.Data) {
            //                    var data = JSON.parse(result.data.Data);
            //                    if (data.data) {
            //                        data.data.forEach(function(obs) {
            //                            obs.timestamp = timestamp;
            //                            if (!observationExists(obs.LocationId)) {
            //                                service.observations.push(obs);
            //                            }
            //                        });
            //                        service.save();
            //                    }
            //                }

            //                resolve(service.observations);
            //            },
            //            reject);
            //});
        };

        var init = function () {
            //getValidObservationsFromLocalStorage();
        };

        init();

        return service;
    });