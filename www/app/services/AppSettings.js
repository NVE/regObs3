angular
    .module('RegObs')
    .provider('AppSettings', function AppSettingsProvider() {

        var settings = {};
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
            prod: 'https://api.nve.no/hydrology/regobs/webapi',
            proxy: '/api'
        };

        var env = 'proxy';

        settings.hazardRatingStyles = {
            '0': {
                weight: 3,
                color: '#C8C8C8',
                dashArray: '',
                fillOpacity: 0.5,
                opacity: 0.4,
                className: 'stable'
            },
            '1': {
                weight: 3,
                color: '#75B100',
                dashArray: '',
                fillOpacity: 0.5,
                opacity: 0.4,
                className: 'calm'
            },
            '2': {
                weight: 3,
                color: '#FFCC33',
                dashArray: '',
                fillOpacity: 0.5,
                opacity: 0.4,
                className: 'balanced'
            },
            '3': {
                weight: 3,
                color: '#E46900',
                dashArray: '',
                fillOpacity: 0.5,
                opacity: 0.4,
                className: 'energized'
            },
            '4': {
                weight: 3,
                color: '#D21523',
                dashArray: '',
                fillOpacity: 0.5,
                opacity: 0.4,
                className: 'assertive'
            },
            '5': {
                weight: 3,
                color: '#3E060B',
                dashArray: '',
                fillOpacity: 0.5,
                opacity: 0.4,
                className: 'royal'
            },
            clicked: {

                fillOpacity: 0.8,
                opacity: 0.9
            }
        };

        settings.endPoints = {
            getObserver: baseUrls[env] + '/Account/GetObserver', //Header Authorization: Basic btoa('user':'pass')
            getObserverGroups: baseUrls[env] + '/Account/GetObserverGroups', //?guid=xxxxxxxx-xxxx-4xxx-xxxxx-xxxxxxxxxxxx,
            getObservationsWithinRadius: baseUrls[env] + '/GetObservationsWithinRadius',
            getDropdowns: baseUrls[env] + '/kdvelements',
            getLocationName: baseUrls[env] + '/Location/GetName', //?latitude=11.11&longitude=11.11&geoHazardId=15
            postRegistration: baseUrls[env] + '/registration', //Headers: rebObs_apptoken, ApiJsonVersion
            trip: baseUrls[env] + '/trip', //POST= Start, PUT= Stop(object with DeviceGuid), Headers: rebObs_apptoken, ApiJsonVersion
            registerAccount: env === 'demo' ? 'http://h-web01.nve.no/stage_RegObsServices' : 'https://api.nve.no/hydrology/regobs/v0.9.0/'
        };

        settings.appId = '***REMOVED***';

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

        this.setHazardRatingStyles = function (newStyle) {
            settings.hazardRatingStyles = newStyle;
        };

        this.getBaseUrls = function () {
            return baseUrls;
        };

        this.$get = function AppSettingsFactory(LocalStorage) {
            settings.getLocale = function () {
                if (!locale.value)
                    locale.value = LocalStorage.get(locale.storageKey, locale.available[0].key);
                return locale;
            };

            settings.setLocale = function (newLocale) {
                locale.value = LocalStorage.set(locale.storageKey, newLocale);
            };

            return settings;
        };
    });