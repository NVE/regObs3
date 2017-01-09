angular
    .module('RegObs')
    .factory('Observations', function ($http, AppSettings, LocalStorage, AppLogging, Utility, $q, PresistentStorage) {
        var service = this;
        var locationsStorageKey = 'regObsLocations';

        service.getStoredObservations = function (geoHazardId) {
            return service._getRegistrationsFromPresistantStorage().then(function (result) {
                if (geoHazardId) {
                    result = result.filter(function (reg) {
                        return reg.GeoHazardTid === geoHazardId;
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
                resolve(JSON.parse('[\r\n  {\r\n    "RegId": 101818,\r\n    "DtObsTime": "2016-12-07T15:34:16.757",\r\n    "DtRegTime": "2016-12-07T15:34:24.1",\r\n    "DtChangeTime": "2016-12-07T15:43:23.233",\r\n    "MunicipalNo": "0301",\r\n    "MunicipalName": "OSLO",\r\n    "ForecastRegionTid": 3045,\r\n    "ForecastRegionName": "Oslo",\r\n    "LocationId": 46366,\r\n    "LocationName": null,\r\n    "ObserverGroupId": 146,\r\n    "ObserverGroupName": "Web Test av versjon 3.0.6",\r\n    "NickName": "awa@nve.no",\r\n    "ObserverId": 2,\r\n    "CompetenceLevelTid": 110,\r\n    "CompetenceLevelName": "*",\r\n    "SourceTid": 0,\r\n    "SourceName": "Ikke gitt",\r\n    "GeoHazardTid": 10,\r\n    "GeoHazardName": "Snø",\r\n    "UtmZone": 33,\r\n    "UtmEast": 257526,\r\n    "UtmNorth": 6658994,\r\n    "LangKey": 1,\r\n    "Registrations": [\r\n      {\r\n        "RegistrationTid": 12,\r\n        "RegistrationName": "Skredhendelse",\r\n        "TypicalValue1": null,\r\n        "TypicalValue2": "38342"\r\n      },\r\n      {\r\n        "RegistrationTid": 26,\r\n        "RegistrationName": "Skredhendelse",\r\n        "TypicalValue1": "3 - Middels",\r\n        "TypicalValue2": "Tørt løssnøskred"\r\n      }\r\n    ],\r\n    "RegistrationCount": 2,\r\n    "PictureCount": 1,\r\n    "FirstPicture": {\r\n      "RegistrationTid": 26,\r\n      "RegistrationName": "Skredhendelse",\r\n      "TypicalValue1": null,\r\n      "TypicalValue2": "38342"\r\n    },\r\n    "Latitude": 59.955843579840064,\r\n    "Longitude": 10.724058837892315\r\n  },\r\n  {\r\n    "RegId": 100742,\r\n    "DtObsTime": "2016-11-28T10:31:05.217",\r\n    "DtRegTime": "2016-11-28T10:31:13.47",\r\n    "DtChangeTime": "2016-11-28T10:31:54.837",\r\n    "MunicipalNo": "0301",\r\n    "MunicipalName": "OSLO",\r\n    "ForecastRegionTid": 3045,\r\n    "ForecastRegionName": "Oslo",\r\n    "LocationId": 45289,\r\n    "LocationName": null,\r\n    "ObserverGroupId": 127,\r\n    "ObserverGroupName": "Test av regObs",\r\n    "NickName": "awa@nve.no",\r\n    "ObserverId": 2,\r\n    "CompetenceLevelTid": 110,\r\n    "CompetenceLevelName": "*",\r\n    "SourceTid": 0,\r\n    "SourceName": "Ikke gitt",\r\n    "GeoHazardTid": 10,\r\n    "GeoHazardName": "Snø",\r\n    "UtmZone": 33,\r\n    "UtmEast": 257526,\r\n    "UtmNorth": 6654930,\r\n    "LangKey": 1,\r\n    "Registrations": [\r\n      {\r\n        "RegistrationTid": 33,\r\n        "RegistrationName": "Skredaktivtet",\r\n        "TypicalValue1": "Ingen skredaktivitet Ikke gitt",\r\n        "TypicalValue2": "Ikke gitt "\r\n      }\r\n    ],\r\n    "RegistrationCount": 1,\r\n    "PictureCount": 0,\r\n    "FirstPicture": null,\r\n    "Latitude": 59.92695339658731,\r\n    "Longitude": 10.778990478517649\r\n  },\r\n  {\r\n    "RegId": 100480,\r\n    "DtObsTime": "2016-11-15T16:56:21.333",\r\n    "DtRegTime": "2016-11-15T16:56:29.94",\r\n    "DtChangeTime": "2016-11-15T16:57:05.55",\r\n    "MunicipalNo": "0301",\r\n    "MunicipalName": "OSLO",\r\n    "ForecastRegionTid": 3045,\r\n    "ForecastRegionName": "Oslo",\r\n    "LocationId": 45107,\r\n    "LocationName": null,\r\n    "ObserverGroupId": 127,\r\n    "ObserverGroupName": "Test av regObs",\r\n    "NickName": "awa@nve.no",\r\n    "ObserverId": 2,\r\n    "CompetenceLevelTid": 110,\r\n    "CompetenceLevelName": "*",\r\n    "SourceTid": 0,\r\n    "SourceName": "Ikke gitt",\r\n    "GeoHazardTid": 10,\r\n    "GeoHazardName": "Snø",\r\n    "UtmZone": 33,\r\n    "UtmEast": 264300,\r\n    "UtmNorth": 6656284,\r\n    "LangKey": 1,\r\n    "Registrations": [\r\n      {\r\n        "RegistrationTid": 13,\r\n        "RegistrationName": "Faretegn",\r\n        "TypicalValue1": "Ferske sprekker ",\r\n        "TypicalValue2": "denne er ikke 4"\r\n      }\r\n    ],\r\n    "RegistrationCount": 1,\r\n    "PictureCount": 0,\r\n    "FirstPicture": null,\r\n    "Latitude": 59.945528546783976,\r\n    "Longitude": 10.764570922853276\r\n  },\r\n  {\r\n    "RegId": 57660,\r\n    "DtObsTime": "2015-03-25T13:16:27.16",\r\n    "DtRegTime": "2015-03-25T13:17:12.68",\r\n    "DtChangeTime": "2015-03-25T13:17:12.68",\r\n    "MunicipalNo": "0301",\r\n    "MunicipalName": "OSLO",\r\n    "ForecastRegionTid": 3045,\r\n    "ForecastRegionName": "Oslo",\r\n    "LocationId": 24494,\r\n    "LocationName": null,\r\n    "ObserverGroupId": 0,\r\n    "ObserverGroupName": null,\r\n    "NickName": "Ragnar@NVE",\r\n    "ObserverId": 6,\r\n    "CompetenceLevelTid": 150,\r\n    "CompetenceLevelName": "*****",\r\n    "SourceTid": 0,\r\n    "SourceName": "Ikke gitt",\r\n    "GeoHazardTid": 10,\r\n    "GeoHazardName": "Snø",\r\n    "UtmZone": 33,\r\n    "UtmEast": 262403,\r\n    "UtmNorth": 6656039,\r\n    "LangKey": 1,\r\n    "Registrations": [\r\n      {\r\n        "RegistrationTid": 21,\r\n        "RegistrationName": "Vær",\r\n        "TypicalValue1": "Snø",\r\n        "TypicalValue2": "0,0 grader"\r\n      }\r\n    ],\r\n    "RegistrationCount": 1,\r\n    "PictureCount": 0,\r\n    "FirstPicture": null,\r\n    "Latitude": 59.97286856421243,\r\n    "Longitude": 10.764570922853276\r\n  },\r\n  {\r\n    "RegId": 37260,\r\n    "DtObsTime": "2013-06-26T08:26:11.977",\r\n    "DtRegTime": "2014-06-26T08:26:32.22",\r\n    "DtChangeTime": "2014-06-26T08:26:32.22",\r\n    "MunicipalNo": "0301",\r\n    "MunicipalName": "OSLO",\r\n    "ForecastRegionTid": 3045,\r\n    "ForecastRegionName": "Oslo",\r\n    "LocationId": 16058,\r\n    "LocationName": null,\r\n    "ObserverGroupId": 0,\r\n    "ObserverGroupName": null,\r\n    "NickName": "sjokko",\r\n    "ObserverId": 221,\r\n    "CompetenceLevelTid": 0,\r\n    "CompetenceLevelName": "",\r\n    "SourceTid": 0,\r\n    "SourceName": "Ikke gitt",\r\n    "GeoHazardTid": 10,\r\n    "GeoHazardName": "Snø",\r\n    "UtmZone": 33,\r\n    "UtmEast": 263742,\r\n    "UtmNorth": 6659482,\r\n    "LangKey": 1,\r\n    "Registrations": [\r\n      {\r\n        "RegistrationTid": 21,\r\n        "RegistrationName": "Vær",\r\n        "TypicalValue1": "Underkjølt regn",\r\n        "TypicalValue2": "-49,9 grader"\r\n      }\r\n    ],\r\n    "RegistrationCount": 1,\r\n    "PictureCount": 0,\r\n    "FirstPicture": null,\r\n    "Latitude": 59.96443698879757,\r\n    "Longitude": 10.72199890136909\r\n  }\r\n]'));
                //var httpConfig = AppSettings.httpConfig;
                //httpConfig.timeout = cancel ? cancel.promise : AppSettings.httpConfig.timeout;

                //$http.post(
                //        AppSettings.getEndPoints().getRegistrationsWithinRadius,
                //        {
                //            GeoHazardId: Utility.getCurrentGeoHazardTid(),
                //            Latitude: latitude,
                //            Longitude: longitude,
                //            Radius: range,
                //            FromDate: AppSettings.getObservationsFromDateISOString()
                //        },
                //        httpConfig)
                //    .then(function (result) {
                //        if (result.data) {
                //            resolve(result.data);
                //        } else {
                //            reject(new Error('Could not find json result data'));
                //        }
                //    })
                //    .catch(reject);
            });
        };

        service._mergeRegistrations = function (destArr, arr) {
            var updateRegistrations = function (existingLocation, newLocation) {
                newLocation.Registrations.forEach(function (reg) {
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

        ///**
        // * Helper method to cleanup empty registrations
        // * @param {} registrations 
        // * @returns {} 
        // */
        //service._cleanupRegistrations = function (registrations) {
        //    var ret = [];
        //    registrations.forEach(function (item) {
        //        var add = false;
        //        if (item.PictureCount > 0 || item.RegistrationCount > 0) {
        //            add = true;
        //        }
        //        if (add) {
        //            ret.push(item);
        //        }
        //    });
        //    return ret;
        //};


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
                    total += item.PictureCount; //Download pictures
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