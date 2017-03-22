angular
    .module('RegObs')
    .factory('Observations', function ($http, AppSettings, LocalStorage, AppLogging, Utility, $q, PresistentStorage, $ionicPlatform, moment, $rootScope, Webworker, $filter, User) {
        var service = this;
        var locationsStorageKey = 'regObsLocations2'; //added 2 to end because old model wasn't compatible with new models returned from API
        var observationUpdatedStorageKey = 'LastObservationUpdate';

        service.getStoredObservations = function (geoHazardId, validateObservationDate) {
            return service._getRegistrationsFromPresistantStorage().then(function (result) {
                AppLogging.log('registrations from presistant storage: ' + result.length);
                if (geoHazardId) {
                    result = result.filter(function (reg) {
                        return reg.GeoHazardTid === geoHazardId;
                    });
                }
                AppLogging.log('registrations after geoHazard filter: ' + result.length);
                if (validateObservationDate) {
                    result = service._cleanupRegistrations(result, true);
                    AppLogging.log('registrations after date cleanup: ' +result.length);
                }

                return result;
            });
        };

        service._getLocationStorageKey = function () {
            return locationsStorageKey + '_' + AppSettings.data.env.replace(/ /g, '');
        };


        /**
        * Get registratons from presistant storage. TODO: rewrite to SQLLite plugin for better performance?
        */
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
                    returnCount: AppSettings.maxObservationsToFetch
                };

                if (geohazardId !== 70) { //give all locations if geoHazard is ice
                    params.observerGuid = (user && !user.anonymous) ? user.Guid : null;
                }

                $http.get(
                        AppSettings.getEndPoints().getLocationsWithinRadius,
                        {
                            params: params,
                            timeout: canceller ? canceller.promise : AppSettings.httpConfig.timeout
                        })
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
            var keepLimit = moment(AppSettings.getObservationsFromDateISOString(), moment.ISO_8601);
            existingRegistrations.forEach(function (item) {
                var date = moment(item.DtObsTime, moment.ISO_8601); //strict parsing
                if (date.isBefore(keepLimit)) { //only keep old values before new observation time to remove deleted items
                    var newRegistration = destArr.filter(function (reg) { return reg.RegId === item.RegId });
                    if (newRegistration.length === 0) {
                        //Registration does not exist, push old value to new list
                        destArr.push(item);
                    }
                }
            });
        };

        service._storeRegistrations = function (registrations) {
            AppLogging.log('_storeRegistrations: ' + registrations.length);
            var path = AppSettings.getRegistrationRelativePath();
            service._cleanupRegistrations(registrations);
            AppLogging.log('_storeRegistrations after cleanup: ' + registrations.length);

            return PresistentStorage.storeFile(path, JSON.stringify(registrations));
        };

        service.saveNewRegistrationsToPresistantStorage = function (registrations) {
            AppLogging.log('saving ' + registrations.length +' new registrations');
            var mergeExistingRegistrations = function (existingRegistrations) {
                AppLogging.log('merging in ' + existingRegistrations.length + ' existingRegistrations registrations');
                service._mergeRegistrations(registrations, existingRegistrations);
                AppLogging.log('save after merge ' + registrations.length + ' registrations');
                return service._storeRegistrations(registrations);
            };
            return service._getRegistrationsFromPresistantStorage().then(mergeExistingRegistrations);
        };


        service._getShowObservationsDaysBack = function () {
            return AppSettings.getObservationsDaysBack();
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
            return toMoment.startOf('day').diff(fromMoment.startOf('day'), 'days');
        };

        /**
         * Helper method to validate observation date
         * @param {} dateStringISO - DtIbsTime, example: 2017-01-10T07:19:57.495Z
         * @returns {} true if within days back limit, else false
         */
        service._validateRegistrationDate = function (dateStringISO, daysBack) {
            var date = moment(dateStringISO, moment.ISO_8601); //strict parsing
            if (!date.isValid()) {
                AppLogging.log('Invalid date: ' + dateStringISO);
                return false;
            }
            var diff = service._diffDays(date, service._now());
            var limit = daysBack || service._getShowObservationsDaysBack();
            if (diff > limit) {
                AppLogging.log('Diff: ' + diff + ' is larger than limit: ' + limit);
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
               tasks.push(service._deleteAllImagesForRegistration(item));
            });
            return $q.all(tasks);
        };

        /**
         * Find old registrations that is old and should be deleted
         * @param {} registrations 
         * @returns {} 
         */
        service._findOldItemsToDelete = function(registrations, daysBack) {
            var keep = [];
            var old = [];

            registrations.forEach(function (item) {
                if (service._validateRegistrationDate(item.DtObsTime, daysBack || 15)) { //Remove items older than 15 days, since max show days back is 14 days
                    keep.push(item);
                } else {
                    old.push(item);
                }
            });

            return {keep: keep, old: old};
        }


        /**
         * Removes all old observation from presistant storage
         * @returns {} 
         */
        service.removeOldObservationsFromPresistantStorage = function () {
            return service._getRegistrationsFromPresistantStorage()
                .then(function (registrations) {
                    AppLogging.log('removeOldObservationsFromPresistantStorage before delete: ' + registrations.length);
                    var filter = service._findOldItemsToDelete(registrations);

                    return service._deleteAllInvalidRegistrationImages(filter.old)
                        .then(function () {
                            AppLogging.log('removeOldObservationsFromPresistantStorage store: ' + filter.keep.length);
                            return service._storeRegistrations(filter.keep);
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

            //var testAndUpdateNearbyLocations = function() {
            //    if (AppSettings.data.showPreviouslyUsedPlaces) {
            //        return service.updateNearbyLocations(latitude, longitude, range, geohazardId, cancel);
            //    } else {
            //        return $q(function(resolve) {
            //            resolve();
            //        });
            //    }
            //};

            return service.removeOldObservationsFromPresistantStorage()
            .then(function () {
                return service._getRegistrationsWithinRadius(latitude,
                    longitude,
                    range,
                    geohazardId,
                    cancel);
            }).then(downloadAllRegistrations).finally(function () {
                AppLogging.log('All registrations saved');
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