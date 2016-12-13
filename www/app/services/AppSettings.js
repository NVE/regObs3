angular
    .module('RegObs')
    .factory('AppSettings', function (LocalStorage, $http, $log, $rootScope) {

        var settings = this;

        //default Values
        var storageKey = 'regobsAppSettings';
        settings._defaults = {
            env: 'regObs',
            emailReceipt: false,
            compass: false,
            gpsTimeout: 10,
            searchRange: 5000,
            locale: 'nb',
            appmode: undefined,
            obsvalidtime: 7 * 24 * 60 * 60,
            showSteepnessMap: true,
            showIceMap: true,
            steepnessMapOpacity: 1.0,
            iceMapOpacity: 1.0,
            maps: [
                { geoHazardTid: 10, tiles: [{ name: 'steepness', opacity: 1.0, visible: true }] },
                { geoHazardTid: 70, tiles: [{ name: 'ice', opacity: 1.0, visible: true }] }
            ],
            showObservations: true,
            showObservationsDaysBack: 3,
            showPreviouslyUsedPlaces: true
        };

        var baseUrls = {
            'regObs': 'https://api.nve.no/hydrology/regobs/webapi_v3.0.6',
            'demo regObs': 'https://api.nve.no/hydrology/demo/regobs/webapi',
            'test regObs': 'http://tst-h-web03.nve.no/regobswebapi'
        };

        var serviceUrls = {
            'regObs': 'https://api.nve.no/hydrology/regobs/v3.0.6/',
            'demo regObs' : 'http://stg-h-web03.nve.no/RegObsServices/',
            'test regObs': 'http://tst-h-web03.nve.no/regobsservices_test/'
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

        //settings.mapTileUrl = 'http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=matrikkel_bakgrunn&zoom={z}&x={x}&y={y}&format=image/png';

        settings.maxMapZoomLevel = 17;

        settings.tiles = [
            { name: 'topo', description: 'Topografisk kart', maxDownloadLimit: 10000, url: 'http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=matrikkel_bakgrunn&zoom={z}&x={x}&y={y}&format=image/png', maxLimitMessage: 'Statens Kartverk har en grense på 10 000 kartblad per bruker per døgn.' },
            { name: 'steepness', description: 'Bratthetskart', geoHazardTid: 10, url: 'http://test-gisapp.nve.no/arcgis/rest/services/wmts/Bratthet/MapServer/tile/{z}/{y}/{x}' },
            { name: 'ice', description: 'Svekket iskart', geoHazardTid: 70, url: 'http://test-gisapp.nve.no/arcgis/rest/services/wmts/SvekketIs/MapServer/tile/{z}/{y}/{x}' }
        ];

        settings.mapTileUrl = function() {
            return settings.tiles[0].url;
        };

        settings.getTileByName = function (name) {
            var filter = settings.tiles.filter(function (t) {
                return t.name === name;
            });
            if (filter.length > 0) {
                return filter[0];
            } else {
                return null;
            }
        };

        //'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'
        settings.load = function () {
            settings.data = LocalStorage.getAndMergeObject(storageKey, angular.copy(settings._defaults));
            var environments = settings.getEnvironments();
            if (environments.indexOf(settings.data.env) === -1) {
                settings.data.env = environments[0];
            }

            settings.save();
        };

        settings.save = function () {
            LocalStorage.setObject(storageKey, settings.data);

            $rootScope.$broadcast('$regObs.appSettingsChanged');
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

        settings.getWebRoot = function () {
            var base = settings.data.env === 'regObs' ? 'www' : settings.data.env.replace(' regObs', '');
            return 'http://' + base + '.regobs.no/';
        };

        settings.getObservationsUrl = function(type){
            return settings.getWebRoot() + type + '/Observations';
        settings.getObservationsUrl = function (type) {
            var base = settings.data.env === 'regObs' ? 'www' : settings.data.env.replace(' regObs', '');
            return 'http://' + base + '.regobs.no/' + type + '/Observations';
        };

        settings.getAppMode = function () {
            return settings.data.appmode;
        };

        settings.setAppMode = function (mode) {
            settings.data.appmode = mode;
            settings.save();
            $rootScope.$broadcast('$regobs.appModeChanged', mode);
        };

        settings.load();


        return settings;

    });
