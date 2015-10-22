angular
    .module('RegObs')
    .provider('AppSettings', function AppSettingsProvider() {

        //default Values
        var storageKey = 'regobsAppSettings';

        var settings = {
            env: 'demo',
            emailReceipt: false,
            appId: '***REMOVED***'
        };

        var locale = {
            value: undefined,
            available: [
                {key: 'nb', name: 'Norsk'},
                {key: 'en', name: 'English'}
            ],
            storageKey: 'regobsLocale'
        };
        var baseUrls = {
            demo: 'https://api.nve.no/hydrology/demo/regobs/webapi',
            //prod: 'https://api.nve.no/hydrology/regobs/webapi',
            proxy: '/api'
        };

        this.getBaseUrls = function () {
            return baseUrls;
        };

        this.$get = function AppSettingsFactory(LocalStorage) {

            settings = LocalStorage.getAndSetObject(storageKey,'appId',settings);
            console.log('Fetched settings', settings);

            settings.changedSetting = function () {
                console.log('Changedsetting', settings);
                LocalStorage.setObject(storageKey, settings);
            };

            settings.getLocale = function () {
                if (!locale.value)
                    locale.value = LocalStorage.get(locale.storageKey, locale.available[0].key);
                return locale;
            };

            settings.setLocale = function (newLocale) {
                locale.value = LocalStorage.set(locale.storageKey, newLocale);
            };

            settings.getEnvironments = function () {
                return Object.keys(baseUrls);
            };
            settings.getEndPoints = function () {
                return {
                    getObserver: baseUrls[settings.env] + '/Account/GetObserver', //Header Authorization: Basic btoa('user':'pass')
                    getObserverGroups: baseUrls[settings.env] + '/Account/GetObserverGroups', //?guid=xxxxxxxx-xxxx-4xxx-xxxxx-xxxxxxxxxxxx,
                    getObservationsWithinRadius: baseUrls[settings.env] + '/GetObservationsWithinRadius',
                    getDropdowns: baseUrls[settings.env] + '/kdvelements',
                    getLocationName: baseUrls[settings.env] + '/Location/GetName', //?latitude=11.11&longitude=11.11&geoHazardId=15
                    postRegistration: baseUrls[settings.env] + '/registration', //Headers: regObs_apptoken, ApiJsonVersion
                    trip: baseUrls[settings.env] + '/trip', //POST= Start, PUT= Stop(object with DeviceGuid), Headers: regObs_apptoken, ApiJsonVersion
                    registerAccount: settings.env === 'demo' ? 'http://h-web01.nve.no/stage_RegObsServices' : 'https://api.nve.no/hydrology/regobs/v0.9.0/'
                };
            };

            return settings;
        };
    });