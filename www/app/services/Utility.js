/**
 * Created by storskel on 06.10.2015.
 */
angular
    .module('RegObs')
    .factory('Utility', function Utility($http, $q, $rootScope, AppSettings, LocalStorage) {
        var service = this;

        var geoHazardTid = {
            snow: 10,
            dirt: 20,
            water: 60,
            ice: 70
        };
        var DAYS_BEFORE_KDV_UPDATE = 7;
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
                RegistrationTID: "22"
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

        service.registrationTid = function(prop){
            return OBSERVATIONS[prop].RegistrationTID;
        };

        service.geoHazardNames = function(tid){
            return geoHazardNames[tid];
        };

        service.geoHazardTid = function(type){
            return (isNaN(type) ? geoHazardTid[type] : type);
        };

        //Antall tegn: 8-4-4-12
        //Format: xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx
        service.createGuid = function () {
            return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
        };

        service.getKdvElements = function () {

            var deferred = $q.defer();
            var kdvFromStorage = LocalStorage.getObject('kdvDropdowns');
            if(kdvFromStorage && kdvFromStorage.KdvRepositories){
                deferred.resolve({data: kdvFromStorage});
                return deferred.promise;

            } else {
                return $http.get('app/json/kdvElements.json');
            }

        };

        service.refreshKdvElements = function(){

                return $http.get(AppSettings.getEndPoints().getDropdowns, AppSettings.httpConfig)
                    .then(function(res){

                        if(res.data && res.data.Data){
                            var newDate = Date.now();
                            LocalStorage.set('kdvDropdowns', res.data.Data);
                            LocalStorage.set('kdvUpdated', newDate);
                            $rootScope.$broadcast('kdvUpdated', newDate);
                        }
                    });

        };

        service.getKdvRepositories = function () {
            return service
                .getKdvElements()
                .then(function (response) {
                    return response.data.KdvRepositories;
                });
        };

        service.getViewRepositories = function () {
            return service
                .getKdvElements()
                .then(function (response) {
                    return response.data.ViewRepositories;
                });
        };

        service.getKdvArray = function (key) {
            return service
                .getKdvRepositories()
                .then(function (KdvRepositories) {
                    return KdvRepositories[key];
                });
        };

        service.twoDecimal = function(num){
            return service.nDecimal(num,2);
        };

        service.nDecimal = function(num, n){
            return parseFloat(num.toFixed(n))
        };

        /**
         * @return {string}
         */
        function S4() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }

        return service;

    });