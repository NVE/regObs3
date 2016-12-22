angular
    .module('RegObs')
    .factory('Observations', function ($http, AppSettings, LocalStorage, AppLogging, Utility, $q, $cordovaFile) {
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
                    "RegistrationTid": 103079,
                    "RegistrationName": "3 Snø observasjoner ved (Vestfold/SANDEFJORD)",
                    "TypicalValue1": "string",
                    "TypicalValue2": "string"
                }
            ]
        },
        {
            LocationName: 'Hedmark/FOLLDAL',
            LocationId: 1234,
            GeoHazardTid: 10,
            Distance: 240,
            DateTime: new Date(),
            LatLngObject: { Latitude: 60.201, Longitude: 11.055 },
            ObserverNick: 'Test person',
            ObserverGroup: '',
            Registrations: [
                {
                    "RegistrationTid": 102011,
                    "RegistrationName": "3 Snø observasjoner ved (Indre Sogn/LUSTER)",
                    "TypicalValue1": "string",
                    "TypicalValue2": "string"
                },
                {
                    "RegistrationTid": 102033,
                    "RegistrationName": "Snø observasjon ved (Indre Sogn/LUSTER)",
                    "TypicalValue1": "string",
                    "TypicalValue2": "string"
                }
            ]
        },
        {
            LocationName: 'Observasjon 2',
            LocationId: 12345,
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

        service.getRegistrationDetails = function (id, cancel) {
            return $q(function (resolve, reject) {
                $http.post(
                        AppSettings.getEndPoints().getRegistration, //TODO: Search by geoHazardId
                        { RegId: id },
                        AppSettings.httpConfig) //TODO: add cancel to http post
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

        service.updateNearbyLocations = function (latitude, longitude, range, geohazardId, canceller) {
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

        var createDir = function (directory) {
            return $q(function (resolve, reject) {
                $cordovaFile.checkDir(cordova.file.dataDirectory, directory)
                    .then(resolve)
                    .catch(function () {
                        AppLogging.log('directory ' + directory + ' not found, creating');
                        $cordovaFile.createDir(cordova.file.dataDirectory, directory, false).then(resolve)
                        .catch(reject);
                    });
            });
        };

        var createDirRecursively = function (directory) {
            return $q(function (resolve) {
                var directories = directory.split('/');
                var i = 0;

                var createDirFragment = function () {
                    if (i < directories.length) {
                        createDir(directories[i])
                            .then(function () {
                                i++;
                                createDirFragment();
                            });
                    } else {
                        resolve();
                    }
                };

                createDirFragment();
            });
        };

        var saveRegistrationDetails = function (registration) {
            var directory = 'reg/' + AppSettings.data.env.replace(/ /g, '');
            var filename = registration.RegId + '.json';
            var writeFile = function () {
                AppLogging.log('Saving registration details to ' + cordova.file.dataDirectory + directory + '/' + filename);
                return $cordovaFile.writeFile(cordova.file.dataDirectory, directory + '/' + filename, JSON.stringify(registration), true);
            };
            return createDirRecursively(directory).then(writeFile);
        };

        var downloadPicture = function (id, progress, onProgress, cancel) {
            return $q(function (resolve) {
                var directory = 'picture/' + AppSettings.data.env.replace(/ /g, '');
                var filename = id + '.jpg';
                var url = AppSettings.getWebRoot() + 'Picture/image/' + id;

                var writeFile = function (data) {
                    AppLogging.log('Saving picture details to ' +
                        cordova.file.dataDirectory +
                        directory +
                        '/' +
                        filename);
                    return $cordovaFile.writeFile(cordova.file.dataDirectory, directory + '/' + filename, data, true);
                };

                var checkIfImageExists = function () {
                    return $cordovaFile.checkFile(cordova.file.dataDirectory, directory + '/' + filename);
                };

                var progressFunc = function () {
                    progress.addComplete();
                    onProgress(progress);
                    resolve();
                };

                var errorFunc = function (error) {
                    AppLogging.warn('Could download and store picture from url ' + url + ' ' + JSON.stringify(error));
                    progress.addError(error);
                    onProgress(progress);
                    resolve();
                };

                var getImageFromHttp = function () {
                    AppLogging.log('Get image from url: ' + url);
                    return $http.get(url, { timeout: cancel.promise });
                };

                var storeImage = function (result) {
                    return createDirRecursively(directory).then(function () { return writeFile(result.data); });
                };

                var downloadImage = function () {
                    getImageFromHttp
                        .then(storeImage)
                        .then(progressFunc)
                        .catch(errorFunc);
                };

                checkIfImageExists()
                    .then(progressFunc) //progress if image allready exists
                    .catch(downloadImage); //Download image if image do not exist
            });
        };

        var saveRegistrationPictures = function (registration, progress, onProgress, cancel) {
            var tasks = [];
            AppLogging.log('Saving pictures for registration ' + registration.RegId);
            registration.Registrations.forEach(function (item) {
                if (item.RegistrationTid === 12 || item.RegistrationTid === 23) {
                    var pictureId = item.TypicalValue2;
                    tasks.push(downloadPicture(pictureId, progress, onProgress, cancel));
                }
            });
            return $q.all(tasks);
        };

        var downloadRegistration = function (id, progress, onProgress, cancel) {
            return service.getRegistrationDetails(id, cancel)
                .then(function (result) {
                    progress.setTotal(progress.getTotal() + result.PictureCount); //Adding pictures to download
                    return saveRegistrationDetails(result)
                        .then(function () {
                            AppLogging.log('Completed saving registration ' + id);
                            progress.addComplete();
                            onProgress(progress);
                        })
                        .catch(function (error) { //save registration details failed
                            AppLogging.warn('Could not save registration ' + id + ' ' + JSON.stringify(error));
                            progress.addError(error);
                            onProgress(progress);
                        })
                        .finally(function () {
                            //Try to download images even if save registration failed
                            return saveRegistrationPictures(result, progress, onProgress, cancel);
                        });
                })
                .catch(function (error) { //get registration details failed
                    AppLogging.warn('Could not get registration from api ' + id + ' ' + JSON.stringify(error));
                    progress.addError(error);
                    onProgress(progress);
                });
        };

        var getRegistrationsWithinRadius = function (latitude, longitude, range, geohazardId, progress, onProgress, cancel) {
            var canceled = false;
            if (cancel) {
                cancel.promise.then(function () { canceled = true; });
            }

            return $q(function (resolve, reject) {
                var doWork = function (i) {
                    AppLogging.log('DoWork ' + i);
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

                doWork(0);
            });
        };



        service.updateObservationsWithinRadius = function (latitude, longitude, range, geohazardId, progress, onProgress, cancel) {
            //return $q(function (resolve) {
            var downloadAllRegistrations = function (locations) {
                var total = 0;
                locations.forEach(function (item) {
                    total += item.Registrations.length;
                });
                progress.setTotal(total);
                onProgress(progress);

                var tasks = [];
                locations.forEach(function (item) {
                    AppLogging.log('Downloading for location ' + item.LocationId);
                    item.Registrations.forEach(function (registration) {
                        tasks.push(downloadRegistration(registration.RegistrationTid,
                                progress,
                                onProgress,
                                cancel));
                    });
                });

                return $q.all(tasks);
            };

            return service.updateNearbyLocations(latitude, longitude, range, geohazardId, cancel)
            .then(function () {
                return getRegistrationsWithinRadius(latitude,
                    longitude,
                    range,
                    geohazardId,
                    progress,
                    onProgress,
                    cancel);
            })
             .then(downloadAllRegistrations);
            //});
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