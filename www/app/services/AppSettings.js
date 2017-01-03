angular
    .module('RegObs')
    .factory('AppSettings', function (LocalStorage, $http, $log) {

        var settings = this;

        //default Values
        var storageKey = 'regobsAppSettings';
        var data = {
            env: 'regObs',
            emailReceipt: false,
            compass: false,
            gpsTimeout: 10,
            searchRange: 5000,
            locale: 'nb',
        };

        var baseUrls = {
            'regObs': 'https://api.nve.no/hydrology/regobs/webapi_v3.0.6',
            'demo regObs': 'https://api.nve.no/hydrology/demo/regobs/webapi',
            'test regObs': 'http://tst-h-web03.nve.no/regobswebapi'
        };

        if(!ionic.Platform.isWebView()){
            baseUrls.proxy = '/api';
            baseUrls.prodproxy = '/prodapi';
            baseUrls.testproxy = '/testapi';
        }

        var serviceUrls = {
            'regObs':'https://api.nve.no/hydrology/regobs/v1.0.0/',
            'demo regObs':'http://stg-h-web03.nve.no/RegObsServices/',
            'test regObs':'http://tst-h-web03.nve.no/regobsservices_test/',
            'proxy':'http://stg-h-web03.nve.no/RegObsServices/'
        };

        $http.get('app/json/secret.json')
            .then(function (response) {
                var headers = {
                    regObs_apptoken: response.data.apiKey,
                    ApiJsonVersion: '3.0.6'
                };

                settings.httpConfig = {
                    headers: headers,
                    timeout: 15000
                };

                settings.httpConfigRegistrationPost = {
                    headers: headers,
                    timeout: 120000
                };
            })
            .catch(function (error) {
                $log.error('Could not set proper http header settings. Do you have app/json/secret.json with proper app token? ' + JSON.stringify(error));
            });

        settings.mapTileUrl = 'http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=matrikkel_bakgrunn&zoom={z}&x={x}&y={y}&format=image/png';
        //'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'
        settings.load = function () {
            settings.data = LocalStorage.getAndSetObject(storageKey, 'searchRange', angular.copy(data));
            var environments = settings.getEnvironments();
            if(environments.indexOf(settings.data.env) === -1){
                settings.data.env = environments[0];
            }
            settings.save();
        };

        settings.save = function () {
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
                getObservationsWithinRadius: baseUrls[settings.data.env] + '/Observations/GetObservationsWithinRadius',
                getDropdowns: baseUrls[settings.data.env] + '/kdvelements',
                getLocationName: baseUrls[settings.data.env] + '/Location/GetName', //?latitude=11.11&longitude=11.11&geoHazardId=15
                postRegistration: baseUrls[settings.data.env] + '/registration', //Headers: regObs_apptoken, ApiJsonVersion
                trip: baseUrls[settings.data.env] + '/trip', //POST= Start, PUT= Stop(object with DeviceGuid), Headers: regObs_apptoken, ApiJsonVersion
                services: serviceUrls[settings.data.env]
            };
        };

        settings.getObservationsUrl = function(type){
            var base = settings.data.env === 'regObs'? 'www' : settings.data.env.replace(' regObs', '');
            return 'http://' + base + '.regobs.no/'+type+'/Observations';
        };

        settings.load();


        return settings;

    });
