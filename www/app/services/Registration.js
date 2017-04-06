angular
    .module('RegObs')
    .factory('Registration', function Registration($rootScope, $ionicPlatform, $http, $state, $ionicPopup, $ionicHistory, $cordovaBadge, LocalStorage, Utility, User, ObsLocation, AppSettings, RegobsPopup, AppLogging, Observations, UserLocation, $q, $timeout) {
        var Registration = this;

        var storageKey = 'regobsRegistrations';
        var unsentStorageKey = 'regobsUnsentRegistrations';
        var newStorageKey = 'regobsNewRegistration';

        var baseLength = Object.keys(createRegistration('snow')).length;

        var messages = [
            'Dårlige nyheter...',
            'Oisann!',
            'Å nei!',
            'Klarte ikke sende registrering',
            'Ikke få panikk...',
            'Problem med innsending',
            'Dette er pinlig...',
            'Uh oh...',
            'Innsending feilet'
        ];

        function createRegistration(type) {

            return {
                "Id": Utility.createGuid(),
                "GeoHazardTID": Utility.geoHazardTid(type),
                //Dette må genereres
                "DtObsTime": new Date().toISOString()
                //Kommenter inn dette dersom en har lyst til å teste bilder (ellers må det testes på device)
                /*,Picture: [{
                 RegistrationTID: '10',
                 PictureImageBase64:'/img/ionic.png',
                 PictureComment: ''
                 }]*/
            };
        };

        Registration.getNewRegistrations = function () {
            var json = LocalStorage.getObject(newStorageKey, []);
            return json;
        };

        Registration.clearNewRegistrations = function () {
            LocalStorage.remove(newStorageKey);
        };

        Registration.createAndGoToNewRegistration = function () {
            var appMode = AppSettings.getAppMode();
            var navigate = function () {
                //$state.go('newregistration');
                if (ObsLocation.isSet()) {
                    $state.go('newregistration');  
                } else {
                    $state.go('confirmlocation');
                }
            };

            if (Registration.isEmpty()) {
                Registration.createNew(Utility.geoHazardTid(appMode));
            }

            if (Registration.data.GeoHazardTID !== Utility.geoHazardTid(appMode)) {
                RegobsPopup.delete('Slett registrering',
                    'Du har en påbegynt ' +
                    Utility.geoHazardNames(Registration.data.GeoHazardTID).toLowerCase() +
                    '-registrering, dersom du går videre blir denne slettet. Vil du slette for å gå videre?')
                    .then(function (response) {
                        if (response) {
                            Registration.createNew(Utility.geoHazardTid(appMode));
                            navigate();
                        }
                    });
            } else {
                navigate();
            }
        };

        function resetRegistration() {

            ObsLocation.remove();
            Registration.data = {};
            Registration.save();

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
            //if (!ObsLocation.isSet()) {
            //    ObsLocation.setPositionToCurrentUserPosition();
            //}
            Registration.save();

            return Registration.data;
        };

        Registration.remove = function () {
            if (!Registration.isEmpty())
                RegobsPopup.delete('Slett registrering', 'Er du sikker på at du vil slette påbegynt registrering?')
                    .then(function (response) {
                        if (response) {
                            resetRegistration();
                            $state.go('start');
                        }
                    });
            else if (Registration.unsent.length) {
                var plural = Registration.unsent.length !== 1;
                var text;
                if (plural) {
                    text = 'Du har ' + Registration.unsent.length + ' usendte registreringer. Vil du slette disse?';
                } else {
                    text = 'Du har ' + Registration.unsent.length + ' usendt registrering. Vil du slette denne?';
                }
                RegobsPopup.delete('Slett usendte registreringer', text)
                    .then(function (response) {
                        if (response) {
                            Registration.unsent = [];
                            Registration.save();

                        }
                    });
            }
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
            //return Object.keys(Registration.data).length <= baseLength;
        };

        Registration.doesExistUnsent = function (type) {
            return Registration.isOfType(type) && !Registration.isEmpty();
        };

        Registration.showSend = function () {
            //return !(Registration.isEmpty() && !Registration.unsent.length);
            if (Registration.unsent.length > 0)
                return true;
            return !Registration.isEmpty() && Registration.data.Id && Registration.data.GeoHazardTID && Registration.data.DtObsTime && ObsLocation.isSet();
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

        Registration.post = function () {

            prepareRegistrationForSending();

            Registration.sending = true;
            var data = angular.copy(Registration.unsent);
            var completed = [];
            var failed = [];

            var checkComplete = function () {
                if ((completed.length + failed.length) === Registration.unsent.length) {

                    Registration.sending = false;
                    Registration.unsent = failed;
                    Registration.save();
                    //resetRegistration();

                    if (failed.length > 0) {
                        var title = getRandomMessage();
                        RegobsPopup.confirm(title,
                            'Fikk ikke kontakt med regObs-serveren. Dette kan skyldes manglende nettilgang, eller at serveren er midlertidig utilgjengelig. Du kan prøve på nytt, eller du kan lagre registrering for å sende inn senere.',
                            'Prøv igjen',
                            'Lagre')
                            .then(function (confirmed) {
                                if (confirmed) {
                                    Registration.post();
                                } else {
                                    RegobsPopup.alert(
                                        'Lagret',
                                        'Dataene dine er lagret. ' +
                                        'Du kan prøve å sende inn på nytt ved et senere tidspunkt.'
                                    );
                                }
                            });
                    } else {
                        resetRegistration();
                        $state.go('start');
                    }
                }
            };

            if (Registration.unsent.length > 0) {
                Utility.resizeAllImages(data)
                    .then(function (processedData) {
                        data = processedData;
                        data.forEach(function (item) {
                            $http.post(AppSettings.getEndPoints().postRegistration, item, AppSettings.httpConfigRegistrationPost).then(function (result) {
                                item.RegId = result;
                                completed.push(item);
                                checkComplete();
                            }).catch(function (error) {
                                item.error = error.status;
                                failed.push(item);
                                checkComplete();
                            });
                        });
                    });
            } else {
                checkComplete();
            }
        };


        Registration.send = function (force) {
            if (!Registration.isEmpty() || Registration.unsent.length) {
                Registration._setObsLocationToUserPositionIfNotSet();
                if (!Registration.isEmpty() && !ObsLocation.isSet()) {
                    RegobsPopup.alert('Posisjon ikke satt', 'Kan ikke sende inn uten posisjon. Vennligst sett posisjon i kartet');
                } else if (!User.getUser().anonymous || force) {
                   Registration.post();
                } else {
                    RegobsPopup.confirm('Du er ikke innlogget', 'Vil du logge inn, eller fortsette med anonym innsending?', 'Send', 'Logg inn')
                        .then(function (confirmed) {
                            if (confirmed) {
                                Registration.send(true);
                            } else {
                                $state.go('settings');
                            }
                        });
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

        function prepareRegistrationForSending() {
            if (Registration.isEmpty()) {
                return;
            }

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
            cleanupWaterLevel2(data.WaterLevel2);

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

            function cleanupWaterLevel2(waterLevel) {
                if (waterLevel) {
                    if (waterLevel.WaterLevelMeasurement) {
                        waterLevel.WaterLevelMeasurement.forEach(function (pic) {
                            Utility.resizeImage(1200, pic.PictureImageBase64, function (imageData) {
                                pic.PictureImageBase64 = imageData;
                            });
                        });
                    }
                }
            };
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
            Registration.data = {};
            var appMode = AppSettings.getAppMode();
            Registration.createNew(Utility.geoHazardTid(appMode));
        }




        function getRandomMessage() {
            return messages[Math.round(Math.random() * (messages.length - 1))];
        }

        Registration.clearNewRegistrationsWithinRange = function () {
            return Observations.getStoredObservations(Utility.getCurrentGeoHazardTid())
                .then(function (storedObservations) {
                    var newRegistrations = Registration.getNewRegistrations();
                    var arr = [];
                    newRegistrations.forEach(function (reg) {
                        if (reg && reg.ObsLocation && reg.ObsLocation.Latitude && reg.ObsLocation.Longitude) {
                            var regLatLng = L.latLng(reg.ObsLocation.Latitude, reg.ObsLocation.Longitude);
                            var keep = true;
                            storedObservations.forEach(function (obs) {
                                var obsLatLng = L.latLng(obs.Latitude, obs.Longitude);

                                if (regLatLng.distanceTo(obsLatLng) < 100) {
                                    //TODO: Removing observations that is nearby. A better way is to check ID, but we don't get ID of new registration form API as of now
                                    keep = false;
                                }
                            });
                            if (keep) {
                                arr.push(reg);
                            }
                        }
                    });
                    LocalStorage.setObject(newStorageKey, arr);
                });
        };

        Registration.load();

        return Registration;
    });
