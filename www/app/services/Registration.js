angular
    .module('RegObs')
    .factory('Registration', function Registration($rootScope, $http, $state, $ionicPopup, $ionicHistory, LocalStorage, Utility, User, ObsLocation, AppSettings, RegobsPopup) {
        var Registration = this;

        var storageKey = 'regobsRegistrations';
        var unsentStorageKey = 'regobsUnsentRegistrations';

        var httpConfig = {
            headers: {
                regObs_apptoken: AppSettings.appId,
                ApiJsonVersion: AppSettings.apiVersion
            }
        };

        var geoHazardTid = {
            snow: 10,
            dirt: 20,
            water: 60,
            ice: 70
        };
        var geoHazardNames = {};
        geoHazardNames[geoHazardTid.snow] = 'snø';
        geoHazardNames[geoHazardTid.dirt] = 'jord';
        geoHazardNames[geoHazardTid.ice] = 'is';
        geoHazardNames[geoHazardTid.water] = 'vann';

        //Brukt der det er bilder (RegistrationTID)
        var OBSERVATIONS = {
            Incident: {
                name: "Ulykke/Hendelse",
                RegistrationTID: "11"
            },
            DangerObs: {
                name: "Faretegn",
                RegistrationTID: "13"
            },
            SnowSurfaceObservation: {
                name: "Snødekke",
                RegistrationTID: "23"
            },
            AvalancheActivityObs: {
                name: "Skredaktivitet",
                RegistrationTID: "27"
            },
            AvalancheObs: {
                name: "Snøskred",
                RegistrationTID: "26"
            },
            WeatherObservation: {
                name: "Vær",
                RegistrationTID: "21"
            },
            SnowProfile: {
                name: "Snøprofil",
                RegistrationTID: "23"
            },
            AvalancheEvalProblem2: {
                name: "Skredproblem",
                RegistrationTID: "32"
            },
            AvalancheEvaluation3: {
                name: "Skredfarevurdering",
                RegistrationTID: "31"
            },
            Picture: {
                name: "Bilde",
                RegistrationTID: "12"
            },
            IceCoverObs: {
                name: "Isdekningsgrad",
                RegistrationTID: "51"
            },
            IceThickness: {
                name: "Snø og istykkelse",
                RegistrationTID: "50"
            },
            WaterLevel: {
                name: "Vannstand",
                RegistrationTID: "61"
            },
            LandSlideObs: {
                name: "Skredhendelse",
                RegistrationTID: "71"
            },
            GeneralObservation: {
                name: "Fritekst",
                RegistrationTID: "10"
            }
        };


  /*      var fareTegn = {
            "Id": "abad1468-63eb-4369-da5f-ddd61207e60a",
            "GeoHazardTID": 10,

            "ObserverGuid": "3ec84df5-226f-4578-b28e-39a9773c4af4",
            "ObserverGroupID": null,
            "Email": false,
            "DtObsTime": "2015-10-07T11:31:44.932Z",
            "ObsLocation": {
                "Latitude": "59,9293385",
                "Longitude": "10,7084991",
                "Uncertainty": "43.46500015258789",
                "UTMSourceTID": "40"
            },
            "Picture": [{"RegistrationTID": "13", "PictureImageBase64": "", "PictureComment": ""}],
            "DangerObs": [{"DangerSignTID": "3", "Comment": "Område: Generelt på fjellet. Beskrivelse: Ggg"}]
        };

        var t = {
            "Id": "451e19c3-76ce-4679-c0db-dc9a1b3acb9d",
            "GeoHazardTID": 10,
            "ObserverGuid": "3ec84df5-226f-4578-b28e-39a9773c4af4",
            "ObserverGroupID": null,
            "Email": false,
            "DtObsTime": "2015-10-06T11:22:05.832Z",
            "ObsLocation": {
                "Latitude": "59,9292275",
                "Longitude": "10,7081913",
                "Uncertainty": "48.07600021362305", //punktum?
                "UTMSourceTID": "40" //Forskjellige
            },
            "Picture": [{"RegistrationTID": "10", "PictureImageBase64": "", "PictureComment": ""}],
            "GeneralObservation": {"ObsHeader": "Dette er en test", "ObsComment": ""}
        };

        var ice = {
            "Registrations": [{
                "Id": "dae61bd4-2951-4ee7-c611-02e8e62e7c90",
                "GeoHazardTID": 70,
                "ObserverGuid": "3ec84df5-226f-4578-b28e-39a9773c4af4",
                "ObserverGroupID": null,
                "Email": false,
                "DtObsTime": "2015-10-14T11:27:14.083Z",
                "ObsLocation": {
                    "Latitude": "59.9293264",
                    "Longitude": "10.7083928",
                    "Uncertainty": null,
                    "UTMSourceTID": "35"
                },
                "DangerObs": [{
                    "DangerSignTID": 701,
                    "Comment": "Område: På denne siden av vannet. Beskrivelse: Kommentar"
                }],
                "Incident": {"IncidentText": "Hei hå", "ActivityInfluencedTID": "720", "DamageExtentTID": "25"},
                "GeneralObservation": {"ObsHeader": "Testtest", "ObsComment": ""},
                "IceCoverObs": {
                    "IceCoverTID": "3",
                    "IceCoverBeforeTID": "10",
                    "IceCapacityTID": "20",
                    "IceSkateabilityTID": "40",
                    "Comment": "Kommentar"
                },
                "IceThickness": {
                    "IceThicknessSum": "0.1200",
                    "SnowDepth": "0.1200",
                    "SlushSnow": "0.1200",
                    "Comment": "Kommentar"
                }
            }]
        };

        var ice2 = {
            "Registrations": [{
                "Id": "2533102f-d86e-417b-762d-1bdc410bfc64",
                "GeoHazardTID": 70,
                "ObserverGuid": "3ec84df5-226f-4578-b28e-39a9773c4af4",
                "ObserverGroupID": null,
                "Email": false,
                "DtObsTime": "2015-10-14T11:54:12.530Z",
                "ObsLocation": {
                    "Latitude": "59.9293264",
                    "Longitude": "10.7083928",
                    "Uncertainty": null,
                    "UTMSourceTID": "35"
                },
                "DangerObs": [{"DangerSignTID": "711", "Comment": "Område: Akkurat her. Beskrivelse: Hei sveis"}]
            }]
        };

        var trip = {
            "GeoHazardID": 10,
            "ObserverGuid": "3ec84df5-226f-4578-b28e-39a9773c4af4",
            "TripTypeID": "30",
            "ObservationExpectedMinutes": 780,
            "Comment": "",
            "DeviceGuid": "24ad5391-9865-4306-0677-5e72c2c31bc5",
            "Lat": "59,9291293",
            "Lng": "10,7080138"
        };*/

        var createRegistration = function (type) {

            return {
                "Id": Utility.createGuid(),
                "GeoHazardTID": (isNaN(type) ? geoHazardTid[type] : type),
                //Dette må genereres
                "DtObsTime": new Date().toISOString(),
                "ObsLocation": {}
            };
        };

        var resetRegistration = function () {

            return Registration.create(Registration.data.GeoHazardTID);
        };

        var saveToUnsent = function (data) {
            data.Registrations.forEach(function (regToSave) {
                var found = false;
                Registration.unsent.forEach(function (savedReg, i) {
                    if(regToSave.Id === savedReg.Id){
                        found = true;
                        Registration.unsent[i] = regToSave;
                    }
                });
                if(!found){
                    Registration.unsent.push(regToSave);
                }
            });
            Registration.save();

        };

        var baseLength = Object.keys(createRegistration('snow')).length;

        Registration.fetchPosition = function(){
            ObsLocation.fetchPosition().then(function(){
                Registration.data.ObsLocation = ObsLocation.get();
                Registration.save();
            });
        };

        Registration.load = function () {
            Registration.data = LocalStorage.getAndSetObject(
                storageKey,
                'DtObsTime',
                createRegistration('snow')
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
        };

        Registration.create = function (type) {
            Registration.data = createRegistration(type);
            Registration.fetchPosition();
            console.log(Registration.data);

            return Registration.data;
        };

        Registration.remove = function () {
            if(!Registration.isEmpty())
                RegobsPopup.delete('Slett registrering', 'Er du sikker på at du vil slette påbegynt registrering?')
                    .then(function (response) {
                        if (response) {
                            return resetRegistration();
                        }
                    });
        };

        Registration.isOfType = function (type) {
            return Registration.data.GeoHazardTID === geoHazardTid[type];
        };

        Registration.isEmpty = function () {
            return Object.keys(Registration.data).length === baseLength;
        };

        Registration.doesExistUnsent = function (type) {
            return Registration.isOfType(type) && !Registration.isEmpty();
        };

        Registration.send = function () {

            var postUrl = AppSettings.getEndPoints().postRegistration;

            prepareRegistrationForSending();

            if(Registration.unsent.length) {
                Registration.sending = true;
                doPost(postUrl, {Registrations: Registration.unsent});
            }

            Registration.unsent = [];
            resetRegistration();

        };

        function prepareRegistrationForSending() {
            if(!Registration.isEmpty()){

                var user = User.getUser();
                var data = Registration.data;

                //Cleanup DangerObs
                if (angular.isArray(data.DangerObs)) {
                    data.DangerObs.forEach(function (dangerObs) {
                        delete dangerObs.tempArea;
                        delete dangerObs.tempComment;
                    });
                }
                if (angular.isArray(data.AvalancheEvalProblem2)) {
                    data.AvalancheEvalProblem2.forEach(function (obs) {
                        if(obs.exposedHeight)
                            delete obs.exposedHeight;
                    });
                }

                angular.extend(data, {
                    "ObserverGuid": user.Guid,
                    "ObserverGroupID": user.chosenObserverGroup || null,
                    "Email": !!AppSettings.emailReceipt
                });

                console.log('User', user);
                console.log('Sending', data);

                saveToUnsent({Registrations: [data]});
            }
        }

        Registration.addPicture = function (propertyKey, data) {
            Registration.initPropertyAsArray('Picture');
            Registration.data.Picture.push({
                RegistrationTID: Registration.getRegistrationTID(propertyKey),
                PictureImageBase64: data,
                PictureComment: ''
            });
        };

        Registration.getRegistrationTID = function (prop) {
            return OBSERVATIONS[prop].RegistrationTID;
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
            if(Registration.propertyExists(prop)){
                if(angular.isArray(Registration.data[prop])){
                    Registration.data[prop] = [];
                } else {
                    Registration.data[prop] = {};
                }
            }
        };

        Registration.propertyExists = function (prop) {
            return !isEmpty(Registration.data[prop]);
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

        //Her sjekkes det om man har prøver å starte en ny registrering (ved at man går inn på en *registrationNew state)
        //Dersom det finnes en registrering fra før av spørres brukeren om den skal slettes
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            var index = toState.name.indexOf('registrationNew');
            if (index > 0) {
                var type = toState.name.substr(0, index); //snow, ice, dirt etc.
                if (!Registration.isOfType(type) && !Registration.isEmpty()) {
                    event.preventDefault();
                    RegobsPopup.delete('Slett registrering', 'Du har en påbegynt ' + geoHazardNames[Registration.data.GeoHazardTID] + '-registrering, dersom du går videre blir denne slettet. Vil du slette for å gå videre?')
                        .then(function (response) {
                            if (response) {
                                Registration.create(type);
                                $state.go(toState.name);
                            }
                        });

                } else if (Registration.isEmpty()) {
                    Registration.create(type);
                }

            }
        });

        function doPost(postUrl, dataToSend){
            return $http.post(postUrl, dataToSend, httpConfig)
                .then(function () {
                    RegobsPopup.alert('Suksess!', 'Observasjon registrert!');
                    Registration.sending = false;
                })
                .catch(function (error) {
                    console.error('Failed to send registration: ' + error.statusText, error);
                    Registration.sending = false;
                    RegobsPopup.confirm(
                        'Klarte ikke sende registrering',
                        (error.statusText?error.statusText+'.':'Mangler nettilgang.') + ' Vil du prøve på nytt?',
                        'Send','Lagre'
                    ).then(function(confirmed){
                        if(confirmed){
                            console.log('Confirm!');
                            doPost(postUrl, dataToSend, httpConfig);
                        } else {
                            console.log('Avbryt');
                            var strings = {
                                usendt: 'Usendt',
                                registrering: 'registrering',
                                denne: 'Denne'
                            };
                            if(dataToSend.Registrations.length > 1){
                                strings.usendt = 'Usendte';
                                strings.registrering = 'registreringer';
                                strings.denne = 'Disse';
                            }
                            RegobsPopup.alert(
                                'Lagret',
                                strings.usendt + ' ' + strings.registrering+
                                ' er lagret. '+strings.denne+
                                ' kan sendes inn ved et senere tidspunkt.'
                            );
                            saveToUnsent(dataToSend);
                        }
                    });

                });

        }

        function isEmpty(obj) {

            // null and undefined are "empty"
            if (obj == null) return true;

            // Assume if it has a length property with a non-zero value
            // that that property is correct.
            if (obj.length > 0)    return false;
            if (obj.length === 0)  return true;

            // Otherwise, does it have any properties of its own?
            // Note that this doesn't handle
            // toString and valueOf enumeration bugs in IE < 9
            for (var key in obj) {
                if (Object.getOwnPropertyNames(obj).length > 0) return false;
            }

            return true;
        }

        Registration.load();

        return Registration;
    });