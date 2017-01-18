angular
    .module('RegObs')
    .factory('Observations', function ($http, AppSettings, LocalStorage, AppLogging, Utility, $q, PresistentStorage, $ionicPlatform, moment) {
        var service = this;
        var locationsStorageKey = 'regObsLocations';
        var observationUpdatedStorageKey = 'LastObservationUpdate';

        service.getStoredObservations = function (geoHazardId, validateObservationDate) {
            return service._getRegistrationsFromPresistantStorage().then(function (result) {
                if (geoHazardId) {
                    result = result.filter(function (reg) {
                        return reg.GeoHazardTid === geoHazardId;
                    });
                }
                if (validateObservationDate) {
                    result = service._cleanupRegistrations(result);
                }

                return result;
            });
        };

        service._getRegistrationsFromPresistantStorage = function () {
            return $q(function (resolve) {
                $ionicPlatform.ready(function () {
                    var path = AppSettings.getRegistrationRelativePath();
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
            });
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

        service._getRegistrationsWithinRadius = function (latitude, longitude, range, geohazardId, progress, onProgress, cancel) {
            return $q(function (resolve, reject) {
                var httpConfig = AppSettings.httpConfig;
                httpConfig.timeout = cancel ? cancel.promise : AppSettings.httpConfig.timeout;
                $http.post(
                        AppSettings.getEndPoints().getRegistrationsWithinRadius,
                        {
                            GeoHazards: [Utility.getCurrentGeoHazardTid()],
                            Latitude: latitude,
                            Longtitude: longitude,
                            Radius: range,
                            FromDate: AppSettings.getObservationsFromDateISOString(),
                            LangKey: AppSettings.getCurrentLangKey()
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

        service._mergeRegistrations = function (destArr, existingRegistrations) {
            existingRegistrations.forEach(function (item) {
                var newRegistration = destArr.filter(function (reg) { return reg.RegId === item.RegId });
                if (newRegistration.length < 0) {
                    //Registration does not exist, push old value to new list
                    destArr.push(item);
                }
            });
        };

        service._storeRegistrations = function (registrations) {
            var path = AppSettings.getRegistrationRelativePath();
            return PresistentStorage.storeFile(path, JSON.stringify(service._cleanupRegistrations(registrations)));
        };

        service._saveNewRegistrationsToPresistantStorage = function (registrations) {
            var mergeExistingRegistrations = function (existingRegistrations) {
                service._mergeRegistrations(registrations, existingRegistrations);
                return service._storeRegistrations(registrations);
            };
            return service._getRegistrationsFromPresistantStorage().then(mergeExistingRegistrations);
        };


        service._getShowObservationsDaysBack = function () {
            return AppSettings.data.showObservationsDaysBack;
        };

        /**
         * Mockable now() 
         * @returns {} current datetime as moment object
         */
        service._now = function () {
            return moment();
        };

        /**
         * Returns diff days from to moments (rounded value)
         * @param {} fromMoment 
         * @param {} toMoment 
         * @returns {} 
         */
        service._diffDays = function (fromMoment, toMoment) {
            return toMoment.diff(fromMoment, 'days');
        };

        /**
         * Helper method to validate observation date
         * @param {} dateStringISO - DtIbsTime, example: 2017-01-10T07:19:57.495Z
         * @returns {} true if within days back limit, else false
         */
        service._validateRegistrationDate = function (dateStringISO) {
            var date = moment(dateStringISO, moment.ISO_8601); //strict parsing
            if (!date.isValid()) return false; //Invalid date
            var diff = service._diffDays(date, service._now());
            var limit = service._getShowObservationsDaysBack();
            if (diff > limit) {
                return false;
            }
            return true;
        };

        /**
         * Helper method to cleanup empty registrations
         * @param {} registrations 
         * @returns {} only valid registrations
         */
        service._cleanupRegistrations = function (registrations) {
            var ret = [];
            registrations.forEach(function (item) {
                if ((item.PictureCount > 0 || item.RegistrationCount > 0) && service._validateRegistrationDate(item.DtObsTime)) {
                    ret.push(item);
                }
            });
            return ret;
        };

        /**
         * Delete images from registration
         * @param {} registration 
         * @returns {} 
         */
        service._deleteAllImagesForRegistration = function (registration) {
            var tasks = [];
            registration.Registrations.forEach(function (item) {
                if (Utility.isObsImage(item)) {
                    var pictureId = item.TypicalValue2;
                    var path = AppSettings.getImageRelativePath(pictureId);

                    var task = function () {
                        return $q(function (resolve) {
                            $ionicPlatform.ready(function () {
                                PresistentStorage.checkIfFileExsists(path)
                               .then(function () {
                                   return PresistentStorage.removeFile(path);
                               })
                               .then(resolve) //deleted complete, resolve
                               .catch(resolve); //file does not exist or could not be deleted, resolve
                            });
                        });
                    };

                    tasks.push(task);
                }
            });
            return $q.all(tasks);
        };

        /**
         * Deletes all images from old registrations
         * @param {} registrations 
         * @returns {} 
         */
        service._deleteAllInvalidRegistrationImages = function (registrations) {
            var tasks = [];
            registrations.forEach(function (item) {
                if (!service._validateRegistrationDate(item.DtObsTime)) {
                    tasks.push(service._deleteAllImagesForRegistration(item));
                }
            });
            return $q.all(tasks);
        };

        /**
         * Removes all old observation from presistant storage
         * @returns {} 
         */
        service.removeOldObservationsFromPresistantStorage = function () {
            return service._getRegistrationsFromPresistantStorage()
                .then(function (registrations) {
                    return service._deleteAllInvalidRegistrationImages(registrations)
                        .then(function () {
                            return service._storeRegistrations(registrations);
                        });
                });
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
            var downloadAllRegistrations = function (registrations) {

                var total = 0;
                registrations.forEach(function (item) {
                    total += item.PictureCount; //Download picture progress
                });
                progress.setTotal(total);
                onProgress(progress);

                return service._saveNewRegistrationsToPresistantStorage(registrations)
                    .then(function () {
                        var tasks = [];
                        registrations.forEach(function (item) {
                            tasks.push(saveRegistrationPictures(item, progress, onProgress, cancel));
                        });

                        return $q.all(tasks);
                    });
            };

            return service.updateNearbyLocations(latitude, longitude, range, geohazardId, cancel)
            .then(service.removeOldObservationsFromPresistantStorage)
            .then(function () {
                return service._getRegistrationsWithinRadius(latitude,
                    longitude,
                    range,
                    geohazardId,
                    progress,
                    onProgress,
                    cancel);
            }).then(downloadAllRegistrations)
            .finally(function () {
                LocalStorage.set(observationUpdatedStorageKey, moment().toISOString());
            });
        };

        /**
         * Check if observations should be updated
         * @returns {} 
         */
        service.checkIfObservationsShouldBeUpdated = function () {
            var lastRun = LocalStorage.get(observationUpdatedStorageKey);
            var warnIfOlderThanDaysBack = 3;
            if (!lastRun) return true;
            var lastRunMoment = moment(lastRun);
            var diff = lastRunMoment.diff(moment());
            if (diff > warnIfOlderThanDaysBack) {
                return true;
            }
            return false;
        };

        return service;
    });