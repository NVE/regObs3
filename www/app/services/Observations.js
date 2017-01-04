angular
    .module('RegObs')
    .factory('Observations', function ($http, AppSettings, LocalStorage, AppLogging, Utility, $q, PresistentStorage) {
        var service = this;
        var locationsStorageKey = 'regObsLocations';

        service.getStoredObservations = function (geoHazardId) {
            return service._getRegistrationsFromPresistantStorage().then(function (result) {
                if (geoHazardId) {
                    result = result.filter(function (item) {
                        return item.Registrations.filter(function (reg) { return reg.GeoHazardTid === geoHazardId }).length > 0;
                    });
                }
                return result;
            });
        };

        service._getRegistrationsFromPresistantStorage = function () {
            return $q(function (resolve) {
                var path = "registrations.json";
                var readRegistrations = function () {
                    PresistentStorage.readAsText(path)
                        .then(function (text) {
                            resolve(JSON.parse(text));
                        }).catch(function (error) {
                            AppLogging.error('Could not read registrations from file: ' + path + '. ' + JSON.stringify(error));
                            resolve([]);
                        });
                };
                PresistentStorage.checkIfFileExsists(path)
                    .then(readRegistrations) //progress if image allready exists
                    .catch(function () {
                        resolve([]);
                    });
            });
        };

        //service.getRegistrationDetailsFromApi = function (id, cancel) {
        //    return $q(function (resolve, reject) {
        //        var httpConfig = AppSettings.httpConfig;
        //        httpConfig.timeout = cancel ? cancel.promise : AppSettings.httpConfig.timeout;
        //        $http.post(
        //                AppSettings.getEndPoints().getRegistration, //TODO: Search by geoHazardId
        //                { RegId: id },
        //                httpConfig)
        //            .then(function (result) {
        //                if (result.data && result.data.length > 0) {
        //                    resolve(result.data[0]);
        //                } else {
        //                    reject(new Error('Could not find json result data'));
        //                }
        //            })
        //            .catch(reject);
        //    });
        //};

        ///**
        // * Get registration details from device storage
        // * @param {} id Registration Id
        // * @returns {} Registration json if found, else reject promise
        // */
        //service.getRegistrationDetailsFromStorage = function (id) {
        //    if (!id) throw Error('id must be set!');
        //    return service._getRegistrationsFromPresistantStorage()
        //        .then(function (result) {
        //            return result.filter(function (item) { return item.RegId === id })[0];
        //        });
        //};

        ///**
        // * Get registratoin details. If not found in local storage, try to fetch from api
        // * @param {} id 
        // * @returns {} Promise with registration json
        // */
        //service.getRegistrationDetails = function (id) {
        //    return service.getRegistrationDetailsFromStorage(id)
        //    .catch(function (error) {
        //        AppLogging.log('Registration id ' + id + ' not found in local storage. Get registration details from api instead. Error: ' + JSON.stringify(error));
        //        return service.getRegistrationDetailsFromApi(id);
        //    });
        //};

        //service.save = function () {
        //    // LocalStorage.setObject(storageKey, service.observations);

        //};

        //var observationExists = function (id) {
        //    return service.observations.filter(function (value) {
        //        return value.LocationId === id;
        //    }).length > 0;
        //};

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

        //service._saveRegistrationDetails = function (registration) {
        //    return PresistentStorage.storeFile(AppSettings.getRegistrationRelativePath(registration.RegId), JSON.stringify(registration));
        //};

        var downloadPicture = function (id, progress, onProgress, cancel) {
            return $q(function (resolve) {
                var path = AppSettings.getImageRelativePath(id);
                var url = AppSettings.getWebImageUrl(id);

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
                    return $http.get(url, { responseType: 'arraybuffer', timeout: cancel.promise });
                };

                var storeImage = function (result) {
                    return PresistentStorage.storeFile(path, result.data, url);
                };

                var downloadImage = function () {
                    getImageFromHttp()
                        .then(storeImage)
                        .then(progressFunc)
                        .catch(errorFunc);
                };

                PresistentStorage.checkIfFileExsists(path)
                    .then(progressFunc) //progress if image allready exists
                    .catch(downloadImage); //Download image if image do not exist
            });
        };

        var saveRegistrationPictures = function (registration, progress, onProgress, cancel) {
            var tasks = [];
            AppLogging.log('Saving pictures for registration ' + registration.RegId);
            registration.Registrations.forEach(function (item) {
                if (Utility.isObsImage(item)) {
                    var pictureId = item.TypicalValue2;
                    tasks.push(downloadPicture(pictureId, progress, onProgress, cancel));
                }
            });
            return $q.all(tasks);
        };

        //var downloadRegistration = function (id, progress, onProgress, cancel) {
        //    return service.getRegistrationDetailsFromApi(id, cancel)
        //        .then(function (result) {
        //            progress.setTotal(progress.getTotal() + result.PictureCount); //Adding pictures to download
        //            return service._saveRegistrationDetails(result)
        //                .then(function () {
        //                    AppLogging.log('Completed saving registration ' + id);
        //                    progress.addComplete();
        //                    onProgress(progress);
        //                })
        //                .catch(function (error) { //save registration details failed
        //                    AppLogging.warn('Could not save registration ' + id + ' ' + JSON.stringify(error));
        //                    progress.addError(error);
        //                    onProgress(progress);
        //                })
        //                .finally(function () {
        //                    //Try to download images even if save registration failed
        //                    return saveRegistrationPictures(result, progress, onProgress, cancel);
        //                });
        //        })
        //        .catch(function (error) { //get registration details failed
        //            AppLogging.warn('Could not get registration from api ' + id + ' ' + JSON.stringify(error));
        //            progress.addError(error);
        //            onProgress(progress);
        //        });
        //};

        var getRegistrationsWithinRadius = function (latitude, longitude, range, geohazardId, progress, onProgress, cancel) {
            return $q(function (resolve, reject) {
                var httpConfig = AppSettings.httpConfig;
                httpConfig.timeout = cancel ? cancel.promise : AppSettings.httpConfig.timeout;

                $http.post(
                        AppSettings.getEndPoints().getRegistrationsWithinRadius,
                        {
                            GeoHazardId: Utility.getCurrentGeoHazardTid(),
                            Latitude: latitude,
                            Longtitude: longitude,
                            Radius: range,
                            FromDate: AppSettings.getObservationsFromDateISOString()
                        },
                        httpConfig)
                    .then(function (result) {
                        if (result.data) {
                            resolve(result.data);
                        } else {
                            reject(new Error('Could not find json result data'));
                        }
                    })
                    .catch(reject);
            });
        };

        service._mergeRegistrations = function (destArr, arr) {
            var updateRegistrations = function(existingLocation, newLocation) {
                newLocation.Registrations.forEach(function(reg) {
                    var existingRegistration = existingLocation.Registrations
                        .filter(function (item) { return item.RegId === reg.RegID });
                    if (existingRegistration.length <= 0) {
                        existingRegistration.push(reg);
                    }
                });
                //existingLocation.LatestRegistration = newLocation.LatestRegistration;
            };

            arr.forEach(function (item) {
                var existingLocation = destArr
                    .filter(function (location) { return location.LocationId === item.LocationId });
                if (existingLocation.length > 0) {
                    //Location exists, update registrations
                    updateRegistrations(existingLocation[0], item);
                } else {
                    destArr.push(item);
                }
            });
        };

        service._saveNewRegistrationsToPresistantStorage = function (registrations) {
            var path = 'registrations.json';

            var storeRegistrations = function (registrations) {
                return PresistentStorage.storeFile(path, JSON.stringify(registrations));
            };

            var mergeExistingRegistrations = function (existingRegistrations) {
                service._mergeRegistrations(registrations, existingRegistrations);
                return storeRegistrations(registrations);
            };

            //TODO: cleanup old registrations

            return service._getRegistrationsFromPresistantStorage().then(mergeExistingRegistrations);
        };

        /**
         * Helper method to cleanup empty registrations
         * @param {} registrations 
         * @returns {} 
         */
        service._cleanupRegistrations = function(registrations) {
            var loc = [];
            registrations.forEach(function (item) {
                var add = false;
                item.Registrations.forEach(function (reg) {
                    if (reg.PictureCount > 0 || reg.RegistrationCount > 0) {
                        add = true;
                    }
                });
                if (add) {
                    loc.push(item);
                }
            });
            return loc;
        };


       /**
        * Update observations within radius
        * @param {} latitude 
        * @param {} longitude 
        * @param {} range 
        * @param {} geohazardId 
        * @param {} progress 
        * @param {} onProgress 
        * @param {} cancel 
        * @returns {} 
        */
        service.updateObservationsWithinRadius = function (latitude, longitude, range, geohazardId, progress, onProgress, cancel) {

            var downloadAllRegistrations = function (locations) {
                locations = service._cleanupRegistrations(locations);

                var total = 0;
                locations.forEach(function (item) {
                    item.Registrations.forEach(function (reg) {
                        total += reg.PictureCount; //Download pictures
                    });
                });
                progress.setTotal(total);
                onProgress(progress);

                return service._saveNewRegistrationsToPresistantStorage(locations)
                    .then(function () {
                        var tasks = [];
                        locations.forEach(function (item) {
                            item.Registrations.forEach(function (registration) {
                                tasks.push(saveRegistrationPictures(registration, progress, onProgress, cancel));
                            });
                        });

                        return $q.all(tasks);
                    });
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
            }).then(downloadAllRegistrations);
            //TODO: Delete old registrations
        };

        //var init = function () {
        //    //getValidObservationsFromLocalStorage();
        //};

        //init();

        return service;
    });