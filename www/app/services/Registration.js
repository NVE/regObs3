angular
    .module('RegObs')
    .factory('Registration', function Registration($http, Utility, User, AppSettings) {
        var service = this;

        var ELEMENTS = [
            {GeoHazardTID: 10, name: "snow", value: "SNOW_GEO_HAZARD"},
            {GeoHazardTID: 20, name: "dirt", value: "DIRT_GEO_HAZARD"},
            {GeoHazardTID: 60, name: "water", value: "WATER_GEO_HAZARD"},
            {GeoHazardTID: 70, name: "ice", value: "ICE_GEO_HAZARD"}
        ];

        var geoHazardTid = {
            snow: 10,
            dirt: 20,
            water: 60,
            ice: 70
        };

        //Brukt der det er bilder (RegistrationTID)
        var OBSERVATIONS = [
            {name: "Ulykke/Hendelse", key: "Incident", RegistrationTID: "11"},
            {name: "Faretegn", key: "DangerObs", RegistrationTID: "13"},
            {name: "Snødekke", key: "SnowSurfaceObservation", RegistrationTID: "23"},
            {name: "Skredaktivitet", key: "AvalancheActivityObs", RegistrationTID: "27"},
            {name: "Snøskred", key: "AvalancheObs", RegistrationTID: "26"},
            {name: "Vær", key: "WeatherObs", RegistrationTID: "21"},
            {name: "Snøprofil", key: "SnowProfile", RegistrationTID: "23"},
            {name: "Skredproblem", key: "AvalancheEvalProblem2", RegistrationTID: "32"},
            {name: "Skredfarevurdering", key: "AvalancheEvaluation3", RegistrationTID: "31"},
            {name: "Bilde", key: "Picture", RegistrationTID: "12"},
            {name: "Isdekningsgrad", key: "IceCoverObs", RegistrationTID: "51"},
            {name: "Snø og istykkelse", key: "IceThickness", RegistrationTID: "50"},
            {name: "Vannstand", key: "WaterLevel", RegistrationTID: "61"},
            {name: "Skredhendelse", key: "LandSlideObs", RegistrationTID: "71"},
            {name: "Fritekst", key: "GeneralObservation", RegistrationTID: "10"}
        ];

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

        service.getKdvElements = function () {
            return $http.get('app/json/kdvElements.json');
        };

        service.getKdvRepositories = function () {
            return service
                .getKdvElements()
                .then(function(response){
                    return response.data.KdvRepositories;
                });
        };

        service.loadKdvArray = function (key) {
            return service
                .getKdvRepositories()
                .then(function (KdvRepositories) {
                    console.log(KdvRepositories[key]);
                    return KdvRepositories[key];
                });
        };

        service.createRegistration = function(type) {

            return {
                "Id": Utility.createGuid(),
                "GeoHazardTID": geoHazardTid[type],
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

        service.sendRegistration= function (registration) {
            var user = User.getUser();
            console.log('User', user);
            angular.extend(registration, {
                "ObserverGuid": user.Guid,
                "ObserverGroupID": user.ObserverGroup,
                "Email": !!AppSettings.emailReceipt
            });
            $http.post(AppSettings.getEndPoints().postRegistration, {Registrations: [registration]}, {
                headers: {
                    regObs_apptoken: AppSettings.appId,
                    ApiJsonVersion: '0.9.0.20140408'
                }
            });
            console.log('Sending', registration);
        };

        service.getPropertyAsArray = function(registration, key){
            if (!(registration[key] && registration[key].length)) {
                registration[key] = [];
            }
            return registration[key];
        };

        service.getPropertyAsObject = function(registration, key){
            if (!(registration[key] && Object.keys(registration[key]).length)) {
                registration[key] = {};
            }
            return registration[key];
        };

        return service;
    });