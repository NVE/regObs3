/**
 * Created by storskel on 06.10.2015.
 */
angular
    .module('RegObs')
    .factory('Utility', function Utility($http) {
        var service = this;

        //Antall tegn: 8-4-4-12
        //Format: xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx
        service.createGuid = function () {
            return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
        };

        service.getKdvElements = function () {
            return $http.get('app/json/kdvElements.json');
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

        /**
         * @return {string}
         */
        function S4() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }

        return service;

    });