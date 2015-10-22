angular
    .module('RegObs')
    .factory('IceRegistration', function IceRegistration($ionicHistory, LocalStorage, Registration, Utility) {

        return {};
       /* var service = this;
        var storageKey = 'IceRegistration';
        service.registration = LocalStorage.getAndSetObject(storageKey, 'GeoHazardTID', Registration.createRegistration('ice'));

        console.log(service.registration);



        //Brukt der det er bilder (RegistrationTID)
        var OBSERVATIONS = [
            {name: "Ulykke/Hendelse", key: "Incident", RegistrationTID: "11"},
            {name: "Faretegn", key: "DangerObs", RegistrationTID: "13"},
            {name: "Isdekningsgrad", key: "IceCoverObs", RegistrationTID: "51"},
            {name: "Snø og istykkelse", key: "IceThickness", RegistrationTID: "50"},
            {name: "Fritekst", key: "GeneralObservation", RegistrationTID: "10"}
        ];

        service.sendRegistration = function () {
            if(angular.isArray(service.registration.DangerObs)){
                service.registration.DangerObs.forEach(function(dangerObs){
                    delete dangerObs.tempArea;
                    delete dangerObs.tempComment;
                });
            }
            Registration.sendRegistration(service.registration);
            service.deleteRegistration();
        };

        service.save = function (shouldGoBack) {
            LocalStorage.setObject(storageKey, service.registration);
            if(shouldGoBack)
                $ionicHistory.goBack();
        };

        service.deleteRegistration = function () {
            service.registration = Registration.createRegistration('ice');
            service.save();
        };




        return service;


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
        };*/
    });