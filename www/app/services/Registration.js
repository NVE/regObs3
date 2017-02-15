angular
    .module('RegObs')
    .factory('Registration', function Registration($rootScope, $ionicPlatform, $http, $state, $ionicPopup, $ionicHistory, $cordovaBadge, LocalStorage, Utility, User, ObsLocation, AppSettings, RegobsPopup, AppLogging, Observations, UserLocation, $q, $timeout) {
        var Registration = this;

        var storageKey = 'regobsRegistrations';
        var unsentStorageKey = 'regobsUnsentRegistrations';

        //var httpConfig = AppSettings.httpConfigRegistrationPost;
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



        Registration.createAndGoToNewRegistration = function () {
            var appMode = AppSettings.getAppMode();
            var navigate = function () {
                if (appMode === 'snow') {
                    $state.go('snowregistrationNew');
                } else if (appMode === 'dirt') {
                    $state.go('dirtregistrationNew');
                } else if (appMode === 'water') {
                    $state.go('waterregistrationNew');
                } else if (appMode === 'ice') {
                    $state.go('iceregistrationNew');
                }
            };



            if (Registration.isEmpty()) {
                Registration.createNew(Utility.geoHazardTid(appMode));
                navigate();
            } else if (Registration.data.GeoHazardTID !== Utility.geoHazardTid(appMode)) {
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
                if (!ObsLocation.isSet()) {
                    ObsLocation.setPositionToCurrentUserPosition();
                }
                navigate();
            }
        };

        function resetRegistration() {
            //return Registration.createNew(Registration.data.GeoHazardTID);
            ObsLocation.remove();
            Registration.data = {};
            Registration.save();
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
                if (window.cordova && window.cordova.plugins.notification.badge) {
                    if (Registration.unsent.length) {
                        cordova.plugins.notification.badge.set(Registration.unsent.length);
                    } else {
                        cordova.plugins.notification.badge.clear();
                    }
                }
            } catch (ex) {
                AppLogging.error('Exception on badge set ' + ex.message);
            }
        };

        Registration.save = function () {
            AppLogging.log('save start');
            LocalStorage.setObject(storageKey, Registration.data);
            LocalStorage.setObject(unsentStorageKey, Registration.unsent);

            Registration.setBadge();

            AppLogging.log('save complete');

            $rootScope.$broadcast('$regObs:registrationSaved');
        };

        Registration.createNew = function (type) {
            Registration.data = createRegistration(type);
            if (!ObsLocation.isSet()) {
                ObsLocation.setPositionToCurrentUserPosition();
            }
            Registration.save();

            return Registration.data;
        };

        Registration.remove = function () {
            if (!Registration.isEmpty())
                RegobsPopup.delete('Slett registrering', 'Er du sikker på at du vil slette påbegynt registrering?')
                    .then(function (response) {
                        if (response) {
                            return resetRegistration();
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
            return Object.keys(Registration.data).length <= baseLength;
        };

        Registration.doesExistUnsent = function (type) {
            return Registration.isOfType(type) && !Registration.isEmpty();
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

        Registration.send = function (force) {
            var postUrl = AppSettings.getEndPoints().postRegistration;
            if (!Registration.isEmpty() || Registration.unsent.length) {
                Registration._setObsLocationToUserPositionIfNotSet();
                if (!Registration.isEmpty() && !ObsLocation.isSet()) {
                    RegobsPopup.alert('Posisjon ikke satt', 'Kan ikke sende inn uten posisjon. Vennligst sett posisjon i kartet');
                } else if (!User.getUser().anonymous || force) {
                    //var currentLocation = null;
                    //if (!Registration.isEmpty()) {
                    //    currentLocation = {
                    //        Latitude: ObsLocation.data.Latitude,
                    //        Longitude: ObsLocation.data.Longitude,
                    //        GeoHazardTID: Registration.data.GeoHazardTID
                    //    };
                    //};
                    prepareRegistrationForSending();

                    if (Registration.unsent.length) {
                        Registration.sending = true;
                        doPost(postUrl, { Registrations: Registration.unsent })
                            .then(function () {
                                resetRegistration();
                                Registration.unsent = [];

                                //TODO: Ask user if he want to download registration and show in map?

                                //if (currentLocation) {
                                //    $timeout(function () {
                                //        Observations.updateObservationsWithinRadius(currentLocation.Latitude,
                                //        currentLocation.Longitude,
                                //        100,
                                //        currentLocation.GeoHazardTID);
                                //    },1000); //Wait 1 sec to registation has processed trough api queue and try to fetch it again so it's shown in map
                                //}
                                $state.go('start');
                            });
                    }

                    Registration.save();
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
            return !Utility.isEmpty(Registration.data[prop]);
        };

        Registration.hasImageForRegistration = function (prop) {
            var registrationTid = Utility.registrationTid(prop);
            return Registration.data.Picture && Registration.data.Picture.filter(function (item) { return item.RegistrationTID === registrationTid }).length > 0;
        };

        /*Registration.propertyArrayExists = function (prop) {
         return Registration.data[prop] && Registration.data[prop].length;
         };*/

        Registration.getExpositionArray = function () {
            return [
                { "val": null, "name": "Ikke gitt" },
                { "val": 0, "name": "N - fra nord" },
                { "val": 45, "name": "NØ - fra nordøst" },
                { "val": 90, "name": "Ø - fra øst" },
                { "val": 135, "name": "SØ - fra sørøst" },
                { "val": 180, "name": "S - fra sør" },
                { "val": 225, "name": "SV - fra sørvest" },
                { "val": 270, "name": "V - fra vest" },
                { "val": 315, "name": "NV - fra nordvest" }
            ];
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
            Registration.save();
        }

        function doPost(postUrl, dataToSend) {

            return $q(function (resolve, reject) {

                var data = angular.copy(dataToSend);

                var success = function () {

                    RegobsPopup.alert(
                        'Suksess!',
                        'Observasjon registrert!'
                    );
                    Registration.sending = false;
                    Registration.save();

                    resolve();
                };

                var exception = function (error) {
                    AppLogging.error('Failed to send registration: ' + error.statusText, error);

                    Registration.sending = false;
                    var title = getRandomMessage();
                    var body = 'Melding fra server: ' +
                        error.statusText +
                        '. Lagring av registreringen blir forsinket eller den feilet. Du kan lagre og sende inn senere, eller prøve igjen. Gi beskjed til regObs-teamet dersom problemet vedvarer. Beklager ulempen :(';

                    var handleUserAction = function (confirmed) {
                        if (confirmed) {
                            AppLogging.log('Confirmed sending again!');
                            post();
                        } else {
                            AppLogging.log('Avbryter sending');

                            RegobsPopup.alert(
                                'Lagret',
                                'Dataene dine er lagret. ' +
                                'Du kan prøve å sende inn på nytt ved et senere tidspunkt.'
                            );
                            saveToUnsent(dataToSend);
                            reject();
                        }
                    };

                    if (error.status <= 0) {
                        RegobsPopup.confirm(title,
                                'Fikk ikke kontakt med regObs-serveren. Dette kan skyldes manglende nettilgang, eller at serveren er midlertidig utilgjengelig. Du kan prøve på nytt, eller du kan lagre registrering for å sende inn senere.',
                                'Prøv igjen',
                                'Lagre')
                            .then(handleUserAction);
                    } else if (error.status === 422) {
                        RegobsPopup.alert('Format stemmer ikke',
                            'Det oppsto et problem ved at innsendingen ikke samstemmer med forventet format. Beklager ulempen:( Melding fra server: ' + error.statusText);
                        reject();
                    } else {
                        RegobsPopup.confirm(title, body, 'Prøv igjen', 'Lagre')
                            .then(handleUserAction);
                    }

                };

                var post = function () {
                    return $http.post(postUrl, data, AppSettings.httpConfigRegistrationPost)
                        .then(success)
                        .catch(exception);
                };

                //Convert to base64 strings and resize
                Utility.resizeAllImages(data)
                    .then(function (processedData) {
                        data = processedData;
                        post();
                    });
            });
        }

        function getRandomMessage() {
            return messages[Math.round(Math.random() * (messages.length - 1))];
        }

        function stopEventAndWarnUser(event, toStateName, type) {
            event.preventDefault();
            RegobsPopup.delete('Slett registrering', 'Du har en påbegynt ' + Utility.geoHazardNames(Registration.data.GeoHazardTID) + '-registrering, dersom du går videre blir denne slettet. Vil du slette for å gå videre?')
                .then(function (response) {
                    if (response) {
                        Registration.createNew(type);
                        $state.go(toStateName);
                    }
                });
        }

        //Her sjekkes det om man har prøver å starte en ny registrering (ved at man går inn på en *registrationNew state)
        //Dersom det finnes en registrering fra før av spørres brukeren om den skal slettes
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            var index = toState.name.indexOf('registrationNew');
            if (index > 0) {
                var type = toState.name.substr(0, index); //snow, ice, dirt etc.
                if (!Registration.isOfType(type) && !Registration.isEmpty()) {
                    stopEventAndWarnUser(event, toState.name, type);

                } else if (Registration.isEmpty()) {
                    Registration.createNew(type);
                }

            }
        });

        //$ionicPlatform.on('resume', function (event) {
        //    if (Registration.isEmpty()) {
        //        resetRegistration();
        //    }
        //});

        Registration.load();

        return Registration;
    });
