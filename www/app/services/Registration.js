angular
    .module('RegObs')
    .factory('Registration', function Registration($rootScope, $ionicPlatform, $http, $state, $ionicPopup, $ionicHistory, $cordovaBadge, LocalStorage, Utility, User, ObsLocation, AppSettings, RegobsPopup, AppLogging, Observations, UserLocation, $q, $timeout, $translate, Raven) {
        var Registration = this;

        var storageKey = 'regobsRegistrations';
        var unsentStorageKey = 'regobsUnsentRegistrations';
        var newStorageKey = 'regobsNewRegistration';

        var baseLength = Object.keys(createRegistration('snow')).length;

        //var messages = [
        //    'Dårlige nyheter...',
        //    'Oisann!',
        //    'Å nei!',
        //    'Klarte ikke sende registrering',
        //    'Ikke få panikk...',
        //    'Problem med innsending',
        //    'Dette er pinlig...',
        //    'Uh oh...',
        //    'Innsending feilet'
        //];

        function createRegistration(type) {

            return {
                "Id": Utility.createGuid(),
                "GeoHazardTID": Utility.geoHazardTid(type),
                //Dette må genereres
                //"DtObsTime": new Date().toISOString()
                //Kommenter inn dette dersom en har lyst til å teste bilder (ellers må det testes på device)
                /*,Picture: [{
                 RegistrationTID: '10',
                 PictureImageBase64:'/img/ionic.png',
                 PictureComment: ''
                 }]*/
            };
        };

        Registration.getNewRegistrations = function () {
            var key = newStorageKey + '_' + AppSettings.data.env.replace(/ /g, '');
            var json = LocalStorage.getObject(key, []);
            return json;
        };

        Registration.clearNewRegistrations = function () {
            var key = newStorageKey + '_' + AppSettings.data.env.replace(/ /g, '');
            LocalStorage.remove(key);
        };

        Registration.createAndGoToNewRegistration = function () {
            if (Registration.checkIfUserIsLoggedIn()) {



                var appMode = AppSettings.getAppMode();
                var navigate = function () {
                    if (!ObsLocation.isSet()) {
                        $state.go('confirmlocation', {}, { reload: true });
                    } else if (!Registration.data.DtObsTime) {
                        $state.go('confirmtime');
                    } else {
                        $state.go('newregistration', {}, { reload: true });
                    }
                };

                if (!Registration.data.GeoHazardTID) {
                    Registration.createNew(Utility.geoHazardTid(appMode));
                }

                if (Registration.data.GeoHazardTID !== Utility.geoHazardTid(appMode)) {
                    $translate(['DELETE', 'OBSERVATION', 'YOU_HAVE_STARTED', 'YOU_HAVE_STARTED_END_TEXT']).then(function (translations) {
                        RegobsPopup.delete(translations['DELETE'] + ' ' + translations['OBSERVATION'].toLowerCase(),
                            translations['YOU_HAVE_STARTED'] + ' ' +
                            Utility.geoHazardNames(Registration.data.GeoHazardTID).toLowerCase() +
                            translations['YOU_HAVE_STARTED_END_TEXT'])
                            .then(function (response) {
                                if (response) {
                                    ObsLocation.remove();
                                    Registration.createNew(Utility.geoHazardTid(appMode));
                                    Utility.clearRegistrationCacheViews().then(function () {
                                        navigate();
                                    });
                                }
                            });
                    });
                } else {
                    navigate();
                }
            }
        };

        function resetRegistration() {

            ObsLocation.remove();
            Registration.data = {};
            Registration.save();
            Utility.clearRegistrationCacheViews();

            $rootScope.$broadcast('$regObs:registrationReset');
        }

        Registration.load = function () {
            Registration.data = LocalStorage.getAndSetObject(
                storageKey,
                'DtObsTime',
                {} //Registration.createNew('snow')
            );
            Registration.unsent = LocalStorage.getAndSetObject(
                unsentStorageKey,
                'length',
                []
            );
        };

        Registration.setBadge = function () {
            AppLogging.log('setting badge');
            try {
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.notification && window.cordova.plugins.notification.badge) {
                    if (Registration.unsent.length) {
                        cordova.plugins.notification.badge.set(Registration.unsent.length);
                    } else {
                        cordova.plugins.notification.badge.set(0);
                        cordova.plugins.notification.badge.clear();
                    }
                }
            } catch (ex) {
                AppLogging.error('Exception on badge set ' + ex.message);
            }
        };

        Registration.save = function () {
            LocalStorage.setObject(storageKey, Registration.data);
            LocalStorage.setObject(unsentStorageKey, Registration.unsent);

            Registration.setBadge();

            AppLogging.log('save complete');

            $rootScope.$broadcast('$regObs:registrationSaved');
        };

        Registration.createNew = function (type) {
            Registration.data = createRegistration(type);
            Registration.save();
            return Registration.data;
        };

        Registration.remove = function () {
            $translate(['DELETE_REGISTRATION', 'DELETE_REGISTRATION_CONFIRM_TEXT', 'DELETE_UNSENT_REGISTRATION', 'DELETE_ONE_UNSENT_REGISTRATION_TEXT']).then(function (translations) {
                var checkunsent = function () {
                    if (Registration.unsent.length) {
                        var plural = Registration.unsent.length !== 1;
                        var text;
                        if (plural) {
                            text = $translate.instant('DELETE_UNSENT_REGISTRATION_TEXT', { unsent: Registration.unsent.length.toString() });
                        } else {
                            text = translations['DELETE_ONE_UNSENT_REGISTRATION_TEXT'];
                        }
                        RegobsPopup.delete(translations['DELETE_UNSENT_REGISTRATION'], text)
                            .then(function (response) {
                                if (response) {
                                    Registration.unsent = [];
                                    Registration.save();
                                    $state.go('start');
                                } else {
                                    if (!Registration.hasStarted()) {
                                        Registration.createNew(Utility.geoHazardTid(AppSettings.getAppMode()));
                                    }
                                }
                            });
                    } else {
                        $state.go('start');
                    }
                };

                if (Registration.hasStarted()) {
                    RegobsPopup.delete(translations['DELETE_REGISTRATION'], translations['DELETE_REGISTRATION_CONFIRM_TEXT'])
                        .then(function (response) {
                            if (response) {
                                resetRegistration();
                                checkunsent();
                            }
                        });
                } else {
                    checkunsent();
                }
            });
        };

        Registration.isOfType = function (type) {
            return Registration.data.GeoHazardTID === Utility.geoHazardTid(type);
        };

        Registration.getObservationsLength = function () {
            if (Registration.isEmpty()) {
                return 0;
            } else {
                var count = 0;
                for (var key in Registration.data) {
                    if (Registration.data.hasOwnProperty(key) && Utility.isObservation(key)) {
                        if (Array.isArray(Registration.data[key])) {
                            count += Registration.data[key].length;
                        } else {
                            count++;
                        }
                    }
                }
                return count;
            }
        }

        Registration.isEmpty = function () {
            var clone = angular.copy(Registration.data);
            delete clone.Id;
            delete clone.GeoHazardTID;
            delete clone.DtObsTime;
            return Utility.isEmpty(clone);
        };

        Registration.hasStarted = function () {
            var clone = angular.copy(Registration.data);
            delete clone.Id;
            delete clone.GeoHazardTID;
            var regHasStarted = !Utility.isEmpty(clone);
            var obsLocationIsSet = ObsLocation.isSet();
            var hasStarted = regHasStarted || obsLocationIsSet;
            return hasStarted;
        };

        Registration.showSend = function () {
            if (Registration.unsent.length > 0)
                return true;
            return !Registration.isEmpty() && ObsLocation.isSet();
        };

        Registration._setObsLocationToUserPositionIfNotSet = function () {
            if (!ObsLocation.isSet() && UserLocation.hasUserLocation()) {
                var lastPos = UserLocation.getLastUserLocation();
                var obsLoc = {
                    Latitude: lastPos.latitude.toString(),
                    Longitude: lastPos.longitude.toString(),
                    Uncertainty: lastPos.accuracy.toString(),
                    UTMSourceTID: ObsLocation.source.fetchedFromGPS
                }
                ObsLocation.set(obsLoc);
            }
        };

        Registration._isDuplicateRegistrationStatus = function (error) {
            return error.status === 400 && error.data && error.data.ModelState && error.data.ModelState.registration && error.data.ModelState.registration.length > 0 && angular.isString(error.data.ModelState.registration[0]) && error.data.ModelState.registration[0].startsWith("Duplicate registration");
        }


        Registration.post = function (onItemCompleteCallback, cancelPromise) {
            return $q(function (resolve) {
                Registration.prepareRegistrationForSending().then(function () {

                    resetRegistration();

                    Registration.sending = true;
                    var completed = [];
                    var failed = [];
                    var cancelled = false;
                    if (cancelPromise) {
                        cancelPromise.promise.then(function () {
                            cancelled = true;
                        });
                    }

                    var checkComplete = function () {
                        if ((completed.length + failed.length) === Registration.unsent.length) {

                            var hasFailed = failed.length > 0;
                            Registration.sending = false;
                            Registration.unsent = failed;
                            Registration.save();

                            var key = newStorageKey + '_' + AppSettings.data.env.replace(/ /g, '');
                            LocalStorage.setObject(key, completed);

                            resolve({ completed: completed, failed: failed });
                        }
                    };

                    if (Registration.unsent.length > 0) {
                        Utility.resizeAllImages(Registration.unsent)
                            .then(function (data) {
                                failed = [];
                                completed = [];
                                data.forEach(function (item) {
                                    if (cancelled) {
                                        item.error = { status: 0, time: new Date() };
                                        failed.push(item);
                                        checkComplete();
                                    } else {
                                        delete item.error;
                                        var postSettings = angular.copy(AppSettings.httpConfigRegistrationPost);
                                        if (cancelPromise) {
                                            postSettings.timeout = cancelPromise.promise;
                                        }
                                        $http.post(AppSettings.getEndPoints().postRegistration, item, postSettings).then(function (result) {
                                            item.RegId = result.data.RegId;
                                            completed.push(item);
                                        }).catch(function (error) {
                                            if (error.status === 409) { //duplicate
                                                completed.push(item);
                                            } else {
                                                item.error = { status: error.status, time: new Date(), message: error.data };
                                                failed.push(item);

                                                if (error.status === 400) { //Bad request is logged
                                                    Raven.captureMessage('Error sending registration. Message: ' + angular.toJson(error.data) + ' Json: ' + angular.toJson(item), {
                                                        level: 'error'
                                                    });
                                                }
                                            }
                                        }).finally(function () {
                                            if (onItemCompleteCallback && angular.isFunction(onItemCompleteCallback)) {
                                                onItemCompleteCallback(item);
                                            }
                                            checkComplete();
                                        });
                                    }
                                });
                            });
                    } else {
                        checkComplete();
                    }
                });
            });
        };

        Registration.checkIfUserIsLoggedIn = function () {
            if (User.getUser().anonymous) {
                $translate(['NOT_LOGGED_IN', 'NOT_LOGGED_IN_DESCRIPTION', 'LOGIN', 'CANCEL']).then(function (translations) {
                    RegobsPopup.confirm(translations['NOT_LOGGED_IN'], translations['NOT_LOGGED_IN_DESCRIPTION'], translations['LOGIN'], translations['CANCEL'])
                        .then(function (confirmed) {
                            if (confirmed) {
                                $state.go('settings');
                            }
                        });
                });
                return false;
            }
            return true;
        }


        Registration.send = function (force) {
            if (!Registration.isEmpty() || Registration.unsent.length) {
                if (Registration.checkIfUserIsLoggedIn()) {
                    $state.go('registrationstatus');
                }
            }
        };

        Registration.initPropertyAsArray = function (prop) {
            if (!Registration.propertyExists(prop)) {
                Registration.data[prop] = [];
            }
            return Registration.data;
        };

        Registration.initPropertyAsObject = function (prop) {
            if (!Registration.propertyExists(prop)) {
                Registration.data[prop] = {};
            }
            return Registration.data;
        };

        Registration.resetProperty = function (prop) {
            if (Registration.propertyExists(prop)) {
                if (angular.isArray(Registration.data[prop])) {
                    Registration.data[prop] = [];
                } else {
                    Registration.data[prop] = {};
                }
            }

        };

        Registration.propertyExists = function (prop) {
            var data = Registration.data[prop];
            if (!data)
                return false;

            var dataJson = angular.toJson(data);
            return !Utility.isEmpty(JSON.parse(dataJson));
        };

        Registration.hasImageForRegistration = function (prop) {
            var registrationTid = Utility.registrationTid(prop);
            return Registration.data.Picture && Registration.data.Picture.filter(function (item) { return item.RegistrationTID === registrationTid }).length > 0;
        };

        Registration.prepareRegistrationForSending = function () {
            return $q(function (resolve) {
                if (Registration.isEmpty()) {
                    resolve();
                } else {

                    var user = User.getUser();

                    var data = angular.copy(Registration.data);
                    var location = angular.copy(ObsLocation.data);

                    //Cleanup
                    cleanupDangerObs(data.DangerObs);
                    stripExposedHeight(data.AvalancheEvalProblem2);
                    stripExposedHeight(data.AvalancheActivityObs2);
                    cleanupGeneralObservation(data.GeneralObservation);
                    cleanupObsLocation(location);
                    cleanupStabilityTest(data.CompressionTest);
                    cleanupIncidenct(data.Incident);
                    cleanupWaterLevel2(data.WaterLevel2)
                        .then(function () {
                            return cleanupDamageObs(data.DamageObs)
                        })
                        .then(function () {
                            delete data.avalChoice;
                            delete data.WaterLevelChoice;

                            angular.extend(data, {
                                "ObserverGuid": user.Guid,
                                "ObserverGroupID": user.chosenObserverGroup || null,
                                "Email": user.anonymous ? false : !!AppSettings.data.emailReceipt,
                                "ObsLocation": location
                            });

                            AppLogging.log('User', user);
                            AppLogging.log('Sending', data);

                            saveToUnsent({ Registrations: [data] });

                            resolve();
                        });
                }

                function cleanupStabilityTest(array) {
                    if (angular.isArray(array)) {
                        array.forEach(function (stest) {
                            delete stest.tempFractureDepth;
                        });
                    }
                }

                function cleanupDangerObs(array) {
                    if (angular.isArray(array)) {
                        array.forEach(function (dangerObs) {
                            delete dangerObs.tempArea;
                            delete dangerObs.tempComment;
                            if (dangerObs.DangerSignTID === null || dangerObs.DangerSignTID === undefined) {
                                dangerObs.DangerSignTID = 0;
                            }
                        });
                    }
                }

                function stripExposedHeight(array) {
                    if (angular.isArray(array)) {
                        array.forEach(function (obs) {
                            if (obs.exposedHeight)
                                delete obs.exposedHeight;
                        });
                    }
                }

                function cleanupGeneralObservation(obs) {
                    if (obs) {
                        obs.ObsHeader = '';
                    }
                }

                function cleanupObsLocation(location) {
                    delete location.place;
                    delete location.Name;
                    if (location.ObsLocationId) {
                        delete location.Latitude;
                        delete location.Longitude;
                        delete location.Uncertainty;
                        delete location.UTMSourceTID;
                    }
                }

                function cleanupIncidenct(incident) {
                    if (incident && !incident.IncidentText) {
                        incident.IncidentText = '';
                    }
                }

                function resizePictures(arr) {
                    return $q(function (resolve) {
                        var callbacks = 0;
                        var total = 0;
                        arr.forEach(function (m) {
                            if (m.Pictures && angular.isArray(m.Pictures)) {
                                total += m.Pictures.length;
                            }
                        });

                        var checkCallbacks = function () {
                            if (callbacks === total) {
                                resolve();
                            };
                        };

                        arr.forEach(function (m) {
                            if (m.Pictures && angular.isArray(m.Pictures)) {
                                m.Pictures.forEach(function (pic) {
                                    Utility.resizeImage(AppSettings.imageSize, pic.PictureImageBase64, function (imageData) {
                                        pic.PictureImageBase64 = imageData;
                                        callbacks++;
                                        checkCallbacks();
                                    });
                                });
                            } else {
                                checkCallbacks();
                            }
                        });
                    });
                };

                function cleanupWaterLevel2(waterLevel) {
                    return $q(function (resolve) {
                        if (!waterLevel || !waterLevel.WaterLevelMeasurement || waterLevel.WaterLevelMeasurement.length === 0) {
                            resolve();
                        } else {
                            resizePictures(waterLevel.WaterLevelMeasurement).then(resolve);
                        }
                    });
                };

                function cleanupDamageObs(damageObs) {
                    return $q(function (resolve) {
                        if (!damageObs || !angular.isArray(damageObs) || damageObs.length === 0) {
                            resolve();
                        } else {
                            damageObs.forEach(function (item) {
                                delete item.checked;
                            });
                            resizePictures(damageObs).then(resolve);
                        }
                    });
                };

            });
        };

        function saveToUnsent(data) {
            data.Registrations.forEach(function (regToSave) {
                var found = false;
                Registration.unsent.forEach(function (savedReg, i) {
                    if (regToSave.Id === savedReg.Id) {
                        found = true;
                        Registration.unsent[i] = regToSave;
                    }
                });
                if (!found) {
                    Registration.unsent.push(regToSave);
                }
            });
        }

        Registration.clearExistingNewRegistrations = function () {
            return Observations.getStoredObservations(Utility.getCurrentGeoHazardTid())
                .then(function (storedObservations) {
                    var newRegistrations = Registration.getNewRegistrations();
                    var arr = [];
                    newRegistrations.forEach(function (reg) {
                        var keep = true;
                        storedObservations.forEach(function (obs) {
                            if (reg.RegId === obs.RegId) {
                                keep = false;
                            }
                        });
                        if (keep) {
                            arr.push(reg);
                        }
                    });
                    var key = newStorageKey + '_' + AppSettings.data.env.replace(/ /g, '');
                    LocalStorage.setObject(key, arr);
                });
        };

        Registration.load();

        return Registration;
    });
