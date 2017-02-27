angular
    .module('RegObs')
    .factory('Observations', function ($http, AppSettings, LocalStorage, AppLogging, Utility, $q, PresistentStorage, $ionicPlatform, moment, $rootScope, Webworker, $filter, User) {
        var service = this;
        var locationsStorageKey = 'regObsLocations2'; //added 2 to end because old model wasn't compatible with new models returned from API
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

        service._getLocationStorageKey = function () {
            return locationsStorageKey + '_' + AppSettings.data.env.replace(/ /g, '');
        };

        service._getRegistrationsFromPresistantStorage = function () {
            return $q(function (resolve) {
                document.addEventListener("deviceready", function () {
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

        service.getLocations = function (geoHazardId, withinBounds) {
            var locations = LocalStorage.getObject(service._getLocationStorageKey(), []);
            if (geoHazardId) {
                locations = locations.filter(function (item) { return item.GeoHazardId === geoHazardId });
            }
            if (withinBounds) {
                locations = locations.filter(function (item) { return withinBounds.contains(L.latLng(item.LatLngObject.Latitude, item.LatLngObject.Longitude)) });
            }
            return locations;
        };




        service.updateNearbyLocations = function (latitude, longitude, range, geohazardId, canceller) {
            return $q(function (resolve, reject) {
                var user = User.getUser();
                AppLogging.log('updateNearbyLocations calling api');

                var params = {
                    latitude: latitude,
                    longitude: longitude,
                    radius: range,
                    geoHazardTypeIds: [geohazardId],
                    returnCount: AppSettings.maxObservationsToFetch,
                    observerGuid: (user && !user.anonymous) ? user.Guid : null
                };

                $http.get(
                        AppSettings.getEndPoints().getLocationsWithinRadius,
                        {
                            params: params,
                            timeout: canceller ? canceller.promise : AppSettings.httpConfig.timeout
                        })
                        //AppSettings.getEndPoints().getObservationsWithinRadius,
                        //                    {
                        //                        params: {
                        //                            latitude: latitude,
                        //                            longitude: longitude,
                        //                            range: range,
                        //                            geohazardId: geohazardId,
                        //                            returnCount: AppSettings.maxObservationsToFetch
                        //                        },
                        //                        timeout: canceller ? canceller.promise : AppSettings.httpConfig.timeout
                        //                    })
                    .then(function (result) {
                        if (result.data) {
                            AppLogging.log('updateNearbyLocations got result, processing data');
                            result.data.forEach(function (location) {
                                if (!location.GeoHazardId) {
                                    location.GeoHazardId = geohazardId; //Setting missing result propery geoHazardId
                                }
                            });
                            var existingLocations = service.getLocations();

                            var mergeExistingLocations = function (data) {
                                data.newLocations.forEach(function (location) {
                                    var existingLocation = data.existingLocations.filter(function (item) {
                                        return item.Id === location.Id || ((item.Name || '').trim() === (location.Name || '').trim());
                                    });
                                    if (existingLocation.length > 0) {
                                        existingLocation[0] = location; //Update existing location with latest result
                                    } else {
                                        if (location.Name) { //Only add locations with name
                                            data.existingLocations.push(location);
                                        }
                                    }
                                });
                                return data.existingLocations;
                            };

                            var myWorker = Webworker.create(mergeExistingLocations);
                            AppLogging.log('updateNearbyLocations starting web worker');
                            myWorker.run({ newLocations: result.data, existingLocations: existingLocations })
                                .then(function (mergedLocations) {
                                    var latLng = L.latLng(latitude, longitude);
                                    mergedLocations = $filter('orderBy')(mergedLocations,
                                        function (item) {
                                            return latLng.distanceTo(L.latLng(item.LatLngObject.Latitude, item.LatLngObject.Longitude));
                                        });
                                    mergedLocations = mergedLocations.slice(0, 1000); //Keep only closest 1000

                                    AppLogging.log('updateNearbyLocations process complete. Storing values.');
                                    LocalStorage.setObject(service._getLocationStorageKey(), mergedLocations);
                                    AppLogging.log('updateNearbyLocations complete');
                                    resolve();
                                }).catch(reject);
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
                    if (onProgress) {
                        onProgress(progress);
                    }
                    resolve();
                };

                var errorFunc = function (error) {
                    AppLogging.warn('Could download and store picture from url ' + url + ' ' + JSON.stringify(error));
                    progress.addError(error);
                    if (onProgress) {
                        onProgress(progress);
                    }
                    resolve();
                };

                var downloadImage = function () {
                    return PresistentStorage.downloadUrl(url, path, cancel)
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
            registration.Pictures.forEach(function (item) {
                var pictureId = item.TypicalValue2;
                tasks.push(downloadPicture(pictureId, progress, onProgress, cancel));
            });
            return $q.all(tasks);
        };

        service._getRegistrationsWithinRadius = function (latitude, longitude, range, geohazardId, cancel) {
            return $q(function (resolve, reject) {
                var httpConfig = AppSettings.httpConfig;
                httpConfig.timeout = cancel ? cancel.promise : AppSettings.httpConfig.timeout;
                $http.post(
                        AppSettings.getEndPoints().getRegistrationsWithinRadius,
                        {
                            GeoHazards: [geohazardId],
                            Latitude: latitude,
                            Longitude: longitude,
                            Radius: range,
                            FromDate: AppSettings.getObservationsFromDateISOString(),
                            LangKey: AppSettings.getCurrentLangKey(),
                            ReturnCount: AppSettings.maxObservationsToFetch
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

        service.saveNewRegistrationsToPresistantStorage = function (registrations) {
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

        service._isSameRegistration = function (first, second) {
            return first.RegId === second.RegId;
        };

        service._isRegistrationEmpty = function (item) {
            return item.PictureCount === 0 && item.RegistrationCount === 0;
        };

        service._registrationExistsInArray = function (arr, item) {
            return arr.filter(function (reg) { return service._isSameRegistration(reg, item) }).length > 0;
        };

        /**
         * Helper method to cleanup empty registrations
         * @param {} registrations 
         * @returns {} only valid registrations
         */
        service._cleanupRegistrations = function (registrations, validateRegistrationTime) {
            var ret = [];
            registrations.forEach(function (item) {
                if (!service._isRegistrationEmpty(item) && !service._registrationExistsInArray(ret, item)) {
                    if (!validateRegistrationTime || service._validateRegistrationDate(item.DtObsTime)) {
                        ret.push(item);
                    }
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
            registration.Pictures.forEach(function (item) {
                var pictureId = item.TypicalValue2;
                var path = AppSettings.getImageRelativePath(pictureId);

                var task = function () {
                    return $q(function (resolve) {
                        PresistentStorage.checkIfFileExsists(path)
                       .then(function () {
                           return PresistentStorage.removeFile(path);
                       })
                       .then(resolve) //deleted complete, resolve
                       .catch(resolve); //file does not exist or could not be deleted, resolve
                    });
                };
                tasks.push(task);
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
        service.updateObservationsWithinRadius = function (latitude, longitude, range, geohazardId, onProgress, cancel) {
            var downloadAllRegistrations = function (registrations) {
                var progress = new RegObs.ProggressStatus();
                var total = 0;
                registrations.forEach(function (item) {
                    total += item.Pictures.length; //Download picture progress
                });
                progress.setTotal(total);
                if (onProgress) {
                    onProgress(progress);
                }

                return service.saveNewRegistrationsToPresistantStorage(registrations)
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
                    cancel);
            }).then(downloadAllRegistrations)
            .finally(function () {
                LocalStorage.set(observationUpdatedStorageKey, moment().toISOString());
                $rootScope.$broadcast('$regObs:observationsUpdated');
            });
        };

        /**
         * Check if observations should be updated
         * @returns {} 
         */
        service.checkIfObservationsShouldBeUpdated = function () {
            var lastRun = LocalStorage.get(observationUpdatedStorageKey);
            var warnIfOlderThanHoursBack = 12;
            if (!lastRun) return true;
            var lastRunMoment = moment(lastRun);
            var diff = lastRunMoment.diff(moment(), 'hours');
            if (diff > warnIfOlderThanHoursBack) {
                return true;
            }
            return false;
        };

        return service;
    });