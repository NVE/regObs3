(function () {
    'use strict';

    /*var trip = {
        "GeoHazardID": 10,
        "ObserverGuid": "3ec84df5-226f-4578-b28e-39a9773c4af4",
        "TripTypeID": "30",
        "ObservationExpectedMinutes": 780,
        "Comment": "",
        "DeviceGuid": "24ad5391-9865-4306-0677-5e72c2c31bc5",
        "Lat": "59,9291293",
        "Lng": "10,7080138"
    };*/

    function Trip($http, AppSettings, Utility, User, ObsLocation, RegobsPopup, LocalStorage) {
        'ngInject';

        var Trip = this;
        var storageKey = 'regobsTrip';
        var defaultModel = {
            started: false,
            time: null,
            data: {}
        };

        var httpConfig = AppSettings.httpConfig;

        Trip.model = LocalStorage.getAndSetObject(
            storageKey, 'data', angular.copy(defaultModel)
        );

        Trip.start = function (type, tripId, expectedMin, comment) {
            if(User.getUser().anonymous){
                return RegobsPopup.alert('Ikke innlogget', 'Vennligst logg inn for å melde tur.');
            }
            if(!(tripId && expectedMin)){
                return RegobsPopup.alert('Vennligst fyll ut felter', 'Både turtype og forventet klokkeslett for innsending av observasjoner må være satt for å melde tur.');
            }
            if(ObsLocation.isSet()){

                Trip.model.time = new Date();
                Trip.model.started = false;
                Trip.model.data = {
                    "GeoHazardID": Utility.geoHazardTid(type),
                    "ObserverGuid": User.getUser().Guid,
                    "TripTypeID": tripId,
                    "ObservationExpectedMinutes": expectedMin,
                    "Comment": comment,
                    "DeviceGuid": Utility.createGuid(),
                    "Lat": ObsLocation.data.Latitude,
                    "Lng": ObsLocation.data.Longitude
                };
                save();


                RegobsPopup.confirm('Bekreft innsending', 'Vil du melde inn denne turen?')
                    .then(function (confirm) {
                        if(confirm){
                            Trip.sending = true;
                            return $http.post(AppSettings.getEndPoints().trip, Trip.model.data, httpConfig);
                        }
                    })
                    .then(function(http){
                        if(http){
                            RegobsPopup.alert('Tur startet', 'Tur startet!');
                            Trip.model.started = true;
                            save();
                        }
                    })
                    .catch(function () {
                        RegobsPopup.alert('Feilmelding', 'Klarte ikke starte tur.');
                        Trip.model.started = false;
                        save();
                    })
                    .finally(function () {
                        Trip.sending = false;
                    });

            } else {
                RegobsPopup.alert('Posisjon ikke satt', 'Posisjon må være satt for å starte tur');
            }
        };

        Trip.stop = function(){
            return RegobsPopup.confirm('Bekreft innsending', 'Vil du avslutte denne turen?')
                .then(function (confirm) {
                    if(confirm){
                        Trip.sending = true;
                        return $http.put(AppSettings.getEndPoints().trip, Trip.model.data, httpConfig)
                    }
                })
                .then(function(httpPromise){
                    if(httpPromise){
                        stop();
                        return RegobsPopup.alert('Tur stoppet', 'Tur avsluttet!');
                    }
                })
                .catch(function () {
                    RegobsPopup.alert('Feilmelding', 'Klarte ikke avslutte tur, dette kan skyldes at den allerede har blitt avsluttet på nett, eller på serveren.');
                    stop();
                })
                .finally(function () {
                    Trip.sending = false;
                });

        };

        Trip.checkIfTripShouldBeAutoStopped = function(){
            if(!Trip.model.time){
                return;
            }
            var now = new Date();
            var modelTime = new Date(Trip.model.time);

            if(Trip.model.time && now.getDay() !== modelTime.getDay()){
                stop();
                return RegobsPopup.alert('Tur stoppet', 'Gårsdagens tur har automatisk blitt avsluttet.');
            }
        };

        function stop(){
            Trip.model = angular.copy(defaultModel);
            save();
            Trip.sending = false;
        }

        function save(){
            LocalStorage.setObject(storageKey, Trip.model);
        }

        return Trip;

    }

    angular.module('RegObs')
        .factory('Trip', Trip);

})();
