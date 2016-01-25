angular
    .module('RegObs')
    .factory('Registration', function Registration($rootScope, $http, $state, $ionicPopup, $ionicHistory, LocalStorage, Utility, User, ObsLocation, AppSettings, RegobsPopup) {
        var Registration = this;

        var storageKey = 'regobsRegistrations';
        var unsentStorageKey = 'regobsUnsentRegistrations';

        var httpConfig = AppSettings.httpConfig;




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

       */

        var createRegistration = function (type) {

            return {
                "Id": Utility.createGuid(),
                "GeoHazardTID": Utility.geoHazardTid(type),
                //Dette må genereres
                "DtObsTime": new Date().toISOString()
            };
        };

        var resetRegistration = function () {

            return Registration.createNew(Registration.data.GeoHazardTID);
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
        };

        Registration.createNew = function (type) {
            Registration.data = createRegistration(type);
            ObsLocation.fetchPosition();
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
            return Registration.data.GeoHazardTID === Utility.geoHazardTid(type);
        };

        Registration.isEmpty = function () {
            return Object.keys(Registration.data).length === baseLength;
        };

        Registration.doesExistUnsent = function (type) {
            return Registration.isOfType(type) && !Registration.isEmpty();
        };

        Registration.send = function () {

            var postUrl = AppSettings.getEndPoints().postRegistration;

            if(!ObsLocation.isSet()) {
                return RegobsPopup.alert('Posisjon ikke satt', 'Kan ikke sende inn uten posisjon.');
            }
            prepareRegistrationForSending();

            if(Registration.unsent.length) {
                Registration.sending = true;
                doPost(postUrl, {Registrations: Registration.unsent});
            }

            Registration.unsent = [];
            resetRegistration();
            Registration.save();

        };

        function cleanupDangerObs(array){
            if (angular.isArray(array)) {
                array.forEach(function (dangerObs) {
                    delete dangerObs.tempArea;
                    delete dangerObs.tempComment;
                });
            }
        }
        function cleanupAvalancheEvalProblem(array){
            if (angular.isArray(array)) {
                array.forEach(function (obs) {
                    if(obs.exposedHeight)
                        delete obs.exposedHeight;
                });
            }
        }

        function cleanupGeneralObservation(obs){
            if(obs){
                obs.ObsHeader = '';
            }
        }

        function cleanupObsLocation(location){
            delete location.place;
            delete location.Name;
            if(location.ObsLocationId){
                delete location.Latitude;
                delete location.Longitude;
                delete location.Uncertainty;
                delete location.UTMSourceTID;
            }
        }

        function prepareRegistrationForSending() {
            if(!Registration.isEmpty()){

                var user = User.getUser();
                var data = Registration.data;
                var location = angular.copy(ObsLocation.data);

                //Cleanup
                cleanupDangerObs(data.DangerObs);
                cleanupAvalancheEvalProblem(data.AvalancheEvalProblem2);
                cleanupGeneralObservation(data.GeneralObservation);
                cleanupObsLocation(location);

                angular.extend(data, {
                    "ObserverGuid": user.Guid,
                    "ObserverGroupID": user.chosenObserverGroup || null,
                    "Email": user.anonymous ? false : !!AppSettings.data.emailReceipt,
                    "ObsLocation": location
                });

                console.log('User', user);
                console.log('Sending', data);

                saveToUnsent({Registrations: [data]});
            }
        }

        Registration.addPicture = function (propertyKey, data) {
            Registration.initPropertyAsArray('Picture');
            Registration.data.Picture.push({
                RegistrationTID: Utility.registrationTid(propertyKey),
                PictureImageBase64: data,
                PictureComment: ''
            });
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

        function doPost(postUrl, dataToSend){

            var success = function(){

                RegobsPopup.alert(
                    'Suksess!',
                    'Observasjon registrert!'
                );
                Registration.sending = false;
                Registration.save();
            };

            var exception = function(error){
                console.error('Failed to send registration: ' + error.statusText, error);

                Registration.sending = false;
                var title = 'Klarte ikke sende registrering';
                var body = (error.statusText? error.statusText + '.' : 'Mangler nettilgang.') + ' Vil du prøve på nytt?';

                var handleUserAction = function(confirmed){
                    if(confirmed){
                        console.log('Confirmed sending again!');
                        doPost(postUrl, dataToSend, httpConfig);
                    } else {
                        console.log('Avbryter sending');

                        RegobsPopup.alert(
                            'Lagret',
                            'Dataene dine er lagret. '+
                            'Du kan prøve å sende inn på nytt ved et senere tidspunkt.'
                        );
                        saveToUnsent(dataToSend);
                    }
                };

                switch(error.status){
                    case 422: // Innsendingen samstemmer ikke med forventet format
                        RegobsPopup.alert('Format stemmer ikke', error.statusText);
                        break;
                    default:
                        RegobsPopup.confirm(title, body,'Send','Lagre')
                            .then(handleUserAction);
                        break;

                }

            };

            return $http.post(postUrl, dataToSend, httpConfig)
                .then(success)
                .catch(exception);

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

        //Her sjekkes det om man har prøver å starte en ny registrering (ved at man går inn på en *registrationNew state)
        //Dersom det finnes en registrering fra før av spørres brukeren om den skal slettes
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            var index = toState.name.indexOf('registrationNew');
            if (index > 0) {
                var type = toState.name.substr(0, index); //snow, ice, dirt etc.
                if (!Registration.isOfType(type) && !Registration.isEmpty()) {
                    event.preventDefault();
                    RegobsPopup.delete('Slett registrering', 'Du har en påbegynt ' + Utility.geoHazardNames(Registration.data.GeoHazardTID) + '-registrering, dersom du går videre blir denne slettet. Vil du slette for å gå videre?')
                        .then(function (response) {
                            if (response) {
                                Registration.createNew(type);
                                $state.go(toState.name);
                            }
                        });

                } else if (Registration.isEmpty()) {
                    Registration.createNew(type);
                }

            }
        });

        Registration.load();

        return Registration;
    });
