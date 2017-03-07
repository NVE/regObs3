angular.module('RegObs').factory('HelpTexts', function (LocalStorage, $http, AppSettings, $q) {
    var service = this;

    service._localStorageKey = 'helptexts';

    service._getAppEmbeddedHelpTexts = function () {
        return $http.get('app/json/helptexts.json').then(function (result) {
            return result.data;
        });
    };

    service._getHelpTexts = function () {       
        var updatedElements = LocalStorage.getObject(service._localStorageKey, []);
        if (updatedElements.length > 0) {
            return $q(function(resolve) {
                resolve(updatedElements);
            });
        } else {
            return service._getAppEmbeddedHelpTexts();
        }
    };

    service._getHelpText = function(tid, geoHazardId, langKey) {
        return service._getHelpTexts()
            .then(function(result) {
                var filtered = result.filter(function(item) {
                    return item.RegistrationTID === tid && item.GeoHazardTID === geoHazardId && item.LangKey === langKey;
                });
                if (filtered.length > 0) {
                    return filtered[0];
                } else {
                    return '';
                }
            });
    };

    service.getHelpText = function(tid, geoHazardId) {
        return service._getHelpText(tid, geoHazardId, AppSettings.getCurrentLangKey());
    };

    return service;
});