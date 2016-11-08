angular
    .module('RegObs')
    .factory('Registration', function Registration($rootScope, $ionicPlatform, $http, $state, $ionicPopup, $ionicHistory, LocalStorage, Utility, User, ObsLocation, AppSettings, RegobsPopup) {
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
        }

        function resetRegistration() {

            return Registration.createNew(Registration.data.GeoHazardTID);
        }

        Registration.load = function () {
            Registration.data = LocalStorage.getAndSetObject(
                storageKey,
                'DtObsTime',
                Registration.createNew('snow')
            );
            Registration.unsent = LocalStorage.getAndSetObject(
                unsentStorageKey,
                'length',
                []
            );
        };

        Registration.save = function () {
            LocalStorage.setObject(storageKey, Registration.data);
            LocalStorage.setObject(unsentStorageKey, Registration.unsent);
            if(window.cordova && window.cordova.plugins.notification.badge){
              if(Registration.unsent.length){
                cordova.plugins.notification.badge.set(Registration.unsent.length);
              } else {
                cordova.plugins.notification.badge.clear();
              }
            }
        };

        Registration.createNew = function (type) {
            Registration.data = createRegistration(type);
            ObsLocation.fetchPosition();
            console.log(Registration.data);
            $rootScope.$broadcast('$ionicView.loaded');

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

        Registration.isEmpty = function () {
            return Object.keys(Registration.data).length === baseLength;
        };

        Registration.doesExistUnsent = function (type) {
            return Registration.isOfType(type) && !Registration.isEmpty();
        };

        Registration.send = function (force) {
            var postUrl = AppSettings.getEndPoints().postRegistration;
            if (!Registration.isEmpty() || Registration.unsent.length) {
                if (!ObsLocation.isSet()) {
                    return RegobsPopup.alert('Posisjon ikke satt', 'Kan ikke sende inn uten posisjon.');
                } else if (!User.getUser().anonymous || force) {

                    prepareRegistrationForSending();

                    if (Registration.unsent.length) {
                        Registration.sending = true;
                        doPost(postUrl, {Registrations: Registration.unsent});
                        Registration.unsent = [];
                        resetRegistration();
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

        /*Registration.propertyArrayExists = function (prop) {
         return Registration.data[prop] && Registration.data[prop].length;
         };*/

        Registration.getExpositionArray = function () {
            return [
                {"val": -1, "name": "Ikke gitt"},
                {"val": 0, "name": "N - nordlig"},
                {"val": 45, "name": "NØ - nordøstlig"},
                {"val": 90, "name": "Ø - østlig"},
                {"val": 135, "name": "SØ - sørøstlig"},
                {"val": 180, "name": "S - sørlig"},
                {"val": 225, "name": "SV - sørvestlig"},
                {"val": 270, "name": "V - vestlig"},
                {"val": 315, "name": "NV - nordvestlig"}
            ];
        };

        function prepareRegistrationForSending() {
          if(Registration.isEmpty()){
            return null;
          }

            var user = User.getUser();

            var data = Registration.data;
            var location = angular.copy(ObsLocation.data);

            //Cleanup
            cleanupDangerObs(data.DangerObs);
            stripExposedHeight(data.AvalancheEvalProblem2);
            stripExposedHeight(data.AvalancheActivityObs2);
            cleanupGeneralObservation(data.GeneralObservation);
            cleanupObsLocation(location);
            delete data.avalChoice;
            delete data.WaterLevelChoice;

            angular.extend(data, {
                "ObserverGuid": user.Guid,
                "ObserverGroupID": user.chosenObserverGroup || null,
                "Email": user.anonymous ? false : !!AppSettings.data.emailReceipt,
                "ObsLocation": location
            });

            console.log('User', user);
            console.log('Sending', data);

            saveToUnsent({Registrations: [data]});

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
        }

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
            Registration.save();


        }

        function doPost(postUrl, dataToSend) {

            var data = angular.copy(dataToSend);

            var success = function () {

                RegobsPopup.alert(
                    'Suksess!',
                    'Observasjon registrert!'
                );
                Registration.sending = false;
                Registration.save();
            };

            var exception = function (error) {
                console.error('Failed to send registration: ' + error.statusText, error);

                Registration.sending = false;
                var title = getRandomMessage();
                var body = 'Melding fra server: ' + error.statusText + '. Lagring av registreringen blir forsinket eller den feilet. Du kan lagre og sende inn senere, eller prøve igjen. Gi beskjed til regObs-teamet dersom problemet vedvarer. Beklager ulempen :(';

                var handleUserAction = function (confirmed) {
                    if (confirmed) {
                        console.log('Confirmed sending again!');
                        post();
                    } else {
                        console.log('Avbryter sending');

                        RegobsPopup.alert(
                            'Lagret',
                            'Dataene dine er lagret. ' +
                            'Du kan prøve å sende inn på nytt ved et senere tidspunkt.'
                        );
                        saveToUnsent(dataToSend);
                    }
                };

                if (error.status <= 0) {
                    RegobsPopup.confirm(title, 'Fikk ikke kontakt med regObs-serveren. Dette kan skyldes manglende nettilgang, eller at serveren er midlertidig utilgjengelig. Du kan prøve på nytt, eller du kan lagre registrering for å sende inn senere.', 'Prøv igjen', 'Lagre')
                        .then(handleUserAction);
                } else if(error.status === 422) {
                    RegobsPopup.alert('Format stemmer ikke', 'Det oppsto et problem ved at innsendingen ikke samstemmer med forventet format. Beklager ulempen:( Melding fra server: ' + error.statusText);
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

        $ionicPlatform.on('resume', function(event){
            if(Registration.isEmpty()){
                resetRegistration();
            }
        });

        Registration.load();

        return Registration;
    });
