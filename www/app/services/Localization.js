/**
 * Created by storskel on 07.09.2015.
 */
angular
    .module('RegObs')
    .factory('Localization', function Localization(AppSettings) {
        var service = {};

        var translations = {
            nb: {
                "language": "Språk",
                "loading...": "Laster...",
                "settings":"Innstillinger",
                "landslide-flood":"Jordskred / flom",
                "avalanche":"Snøskred",
                "map":"Kart",
                "dummy":"dummy"
            },
            en: {
                "language": "Language",
                "loading...": "Loading...",
                "settings":"Settings",
                "landslide-flood":"Landslide / flood",
                "avalanche":"Avalanche",
                "map":"Map",
                "dummy":"dummy"
            }
        };

        service.getTranslations = function (localeOverride) {
            var locKey = localeOverride || AppSettings.getLocale().value;
            return translations[locKey];
        };

        service.getText = function (key) {
            return (service.getTranslations())[key];
        };

        return service;

    });
