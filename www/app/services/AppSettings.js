angular
    .module('RegObs')
    .factory('AppSettings', function AppSettings(LocalStorage) {

        var settings = this;

        //default Values
        var storageKey = 'regobsAppSettings';
        var data = {
            env: 'demo',
            emailReceipt: false,
            locale: 'nb'
        };

        var baseUrls = {
            demo: 'https://api.nve.no/hydrology/demo/regobs/webapi',
            //prod: 'https://api.nve.no/hydrology/regobs/webapi',
            proxy: '/api'
        };

        settings.data = Object.create(data);
        settings.appId = '***REMOVED***';

        settings.load = function () {
            settings.data = LocalStorage.getAndSetObject(storageKey, 'env', Object.create(data));

        };

        settings.save = function () {
            console.log('Changedsetting', settings);
            LocalStorage.setObject(storageKey, settings.data);
        };

        settings.getLocale = function () {
            return settings.data.locale;
        };

        settings.setLocale = function (newLocale) {
            settings.data.locale = newLocale;
            settings.save();
        };

        settings.getEnvironments = function () {
            return Object.keys(baseUrls);
        };
        settings.getEndPoints = function () {
            return {
                getObserver: baseUrls[settings.data.env] + '/Account/GetObserver', //Header Authorization: Basic btoa('user':'pass')
                getObserverGroups: baseUrls[settings.data.env] + '/Account/GetObserverGroups', //?guid=xxxxxxxx-xxxx-4xxx-xxxxx-xxxxxxxxxxxx,
                getObservationsWithinRadius: baseUrls[settings.data.env] + '/GetObservationsWithinRadius',
                getDropdowns: baseUrls[settings.data.env] + '/kdvelements',
                getLocationName: baseUrls[settings.data.env] + '/Location/GetName', //?latitude=11.11&longitude=11.11&geoHazardId=15
                postRegistration: baseUrls[settings.data.env] + '/registration', //Headers: regObs_apptoken, ApiJsonVersion
                trip: baseUrls[settings.data.env] + '/trip', //POST= Start, PUT= Stop(object with DeviceGuid), Headers: regObs_apptoken, ApiJsonVersion
                registerAccount: settings.data.env === 'demo' ? 'http://h-web01.nve.no/stage_RegObsServices' : 'https://api.nve.no/hydrology/regobs/v0.9.0/'
            };
        };

        settings.load();

        console.log(settings);

        return settings;

    });