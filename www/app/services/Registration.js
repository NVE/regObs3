angular
    .module('RegObs')
    .factory('Registration', function Registration($rootScope, $state, $ionicPopup, $http, $ionicHistory, LocalStorage, Utility, User, AppSettings) {
        var service = this;

        var storageKey = 'regobsRegistrations';

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
            WeatherObs: {
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


        var fareTegn = {
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
        };

        var showConfirm = function (text, confirmText, confirmClass) {
            return $ionicPopup.confirm({
                title: 'Slett observasjoner',
                template: text,
                buttons: [
                    {text: 'Avbryt'},
                    {
                        text: 'Slett',
                        type: 'button-assertive',
                        onTap: function (e) {
                            // Returning a value will cause the promise to resolve with the given value.
                            return true;
                        }
                    }
                ]
            });
        };

        var createRegistration = function (type) {
            return {
                "Id": Utility.createGuid(),
                "GeoHazardTID": (isNaN(type) ? geoHazardTid[type] : type),
                //Dette må genereres
                "DtObsTime": new Date().toISOString(),
                "ObsLocation": {
                    "Latitude": '59.9293264',
                    "Longitude": '10.7083928',
                    "Uncertainty": null,
                    "UTMSourceTID": "35"
                }
            };
        };

        var setRegistration = function (type) {
            service.registration = createRegistration(type);
            service.save();
            return service.registration;
        };

        var resetRegistration = function () {
            return setRegistration(service.registration.GeoHazardTID);
        };

        service.load = function () {
            service.registration = LocalStorage.getAndSetObject(
                storageKey,
                'DtObsTime',
                createRegistration('snow')
            );
        };

        service.save = function (shouldGoBack) {

            if (shouldGoBack)
                $ionicHistory.goBack();
            else
                LocalStorage.setObject(storageKey, service.registration);
        };

        service.createNewRegistration = function (type) {
            setRegistration(type);
        };

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            var index = toState.name.indexOf('registrationNew');
            if (index > 0) {
                var type = toState.name.substr(0, index);
                if (!service.isOfType(type) && !service.isEmpty()) {
                    event.preventDefault();
                    showConfirm('Du har en påbegynt ' + geoHazardNames[service.registration.GeoHazardTID] + '-registrering, dersom du går videre blir denne slettet. Vil du slette for å gå videre?')
                        .then(function (response) {
                            if (response) {
                                setRegistration(type);
                                $state.go(toState.name);
                            }
                        });

                } else if (service.isEmpty()) {
                    setRegistration(type);
                }

            }
        });

        service.deleteRegistration = function () {
            showConfirm('Er du sikker på at du vil slette lokalt lagret registrering?')
                .then(function (response) {
                    if (response) {
                        return resetRegistration();
                    }
                });
        };

        service.isOfType = function (type) {
            return service.registration.GeoHazardTID === geoHazardTid[type];
        };

        service.isEmpty = function () {
            return Object.keys(service.registration).length === baseLength;
        };

        service.doesExistUnsent = function (type) {
            return service.isOfType(type) && !service.isEmpty();
        };

        service.sendRegistration = function () {
            var postUrl = AppSettings.getEndPoints().postRegistration;
            var user = User.getUser();
            var registration = service.registration;
            var httpConfig = {
                headers: {
                    regObs_apptoken: AppSettings.appId,
                    ApiJsonVersion: '0.9.0.20140408'
                }
            };

            //Cleanup DangerObs
            if (angular.isArray(registration.DangerObs)) {
                registration.DangerObs.forEach(function (dangerObs) {
                    delete dangerObs.tempArea;
                    delete dangerObs.tempComment;
                });
            }

            angular.extend(registration, {
                "ObserverGuid": user.Guid,
                "ObserverGroupID": user.chosenObserverGroup,
                "Email": !!AppSettings.emailReceipt
            });

            var dataToSend = {
                Registrations: [registration]
            };

            console.log('User', user);
            console.log('Sending', registration);

            return $http.post(postUrl, dataToSend, httpConfig)
                .then(function () {
                    return resetRegistration();
                })
                .catch(function (error) {
                    alert('Failed to send registration ' + error.reason);
                    console.error('Failed to send registration', error)
                });

        };

        service.addPicture = function (propertyKey, data) {
            var picArray = service.getPropertyAsArray('Picture');
            picArray.push({
                RegistrationTID: service.getRegistrationTID(propertyKey),
                PictureImageBase64: data,
                PictureComment: ''
            });
        };

        service.getRegistrationTID = function (prop) {
            return OBSERVATIONS[prop].RegistrationTID;
        };

        service.getPropertyAsArray = function (prop) {
            if (!service.propertyArrayExists(prop)) {
                service.registration[prop] = [];
            }
            return service.registration[prop];
        };

        service.getPropertyAsObject = function (prop) {
            if (!service.propertyObjectExists(prop)) {
                service.registration[prop] = {};
            }
            return service.registration[prop];
        };

        service.propertyObjectExists = function (prop) {
            return service.registration[prop] && Object.keys(service.registration[prop]).length;
        };

        service.propertyArrayExists = function (prop) {
            return service.registration[prop] && service.registration[prop].length;
        };

        service.getExpositionArray = function () {
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

        var baseLength = Object.keys(createRegistration('snow')).length;

        service.load();

        return service;
    });