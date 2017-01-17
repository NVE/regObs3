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
            searchRange: 50000,
            locale: 'nb',
            appmode: undefined,
            obsvalidtime: 7 * 24 * 60 * 60,
            showSteepnessMap: true,
            showIceMap: true,
            steepnessMapOpacity: 1.0,
            iceMapOpacity: 1.0,
            maps: [
                { geoHazardTid: 10, tiles: [{ name: 'steepness', opacity: 0.5, visible: true }] },
                { geoHazardTid: 70, tiles: [{ name: 'ice', opacity: 0.5, visible: true }] },
                { geoHazardTid: 60, tiles: [{ name: 'flood', opacity: 0.5, visible: true }] }
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

        settings.maxMapZoomLevel = 17;
        settings.mapFolder = 'maps';
        settings.debugTiles = false; //Turn on to debug offline/fallback/tiles

        settings.tiles = [
            { name: 'topo', description: 'Topografisk kart', maxDownloadLimit: 10000, avgTileSize: 19000, url: 'http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=matrikkel_bakgrunn&zoom={z}&x={x}&y={y}&format=image/jpeg' },
            { name: 'steepness', description: 'Bratthetskart', geoHazardTid: 10, avgTileSize: 37693, url: 'http://gis3.nve.no/arcgis/rest/services/wmts/Bratthet/MapServer/tile/{z}/{y}/{x}' },
            { name: 'ice', description: 'Svekket iskart', geoHazardTid: 70, avgTileSize: 37693, url: 'http://gis3.nve.no/arcgis/rest/services/wmts/SvekketIs/MapServer/tile/{z}/{y}/{x}' },
            { name: 'flood', description: 'Flomsoner', geoHazardTid: 60, avgTileSize: 37693, url: 'http://gis3.nve.no/arcgis/rest/services/wmts/Flomsoner1/MapServer/tile/{z}/{y}/{x}' }
        ];

        settings.mapTileUrl = function () {
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

            $rootScope.$broadcast('$regObs:appSettingsChanged');
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
                getRegistrationsWithinRadius: baseUrls[settings.data.env] + '/Search/WithinRadius', //POST json {"GeoHazards": [10],"LangKey" : 1,"FromDate": "2013-01-03","ToDate": "2017-01-03","Latitude": 59.927032,"Longtitude": 10.710034,"Radius": 40000,"ReturnCount": 100}
                getDropdowns: baseUrls[settings.data.env] + '/kdvelements',
                getLocationName: baseUrls[settings.data.env] + '/Location/GetName', //?latitude=11.11&longitude=11.11&geoHazardId=15
                postRegistration: baseUrls[settings.data.env] + '/registration', //Headers: regObs_apptoken, ApiJsonVersion
                getRegistration: baseUrls[settings.data.env] + '/search/avalanche',
                trip: baseUrls[settings.data.env] + '/trip', //POST= Start, PUT= Stop(object with DeviceGuid), Headers: regObs_apptoken, ApiJsonVersion
                services: serviceUrls[settings.data.env]
            };
        };

        settings.getWebRoot = function () {
            var base = settings.data.env === 'regObs' ? 'www' : settings.data.env.replace(' regObs', '');
            return 'http://' + base + '.regobs.no/';
        };

        settings.getWarningUrl = function () {
            var baseUrl = 'http://www.varsom.no/';
            switch (settings.data.appmode) {
                case 'snow':
                    return baseUrl + 'snoskredvarsling';
                case 'ice':
                    return baseUrl + 'isvarsling';
            }
            return baseUrl + 'flom-og-jordskredvarsling';
        };

        /**
         * Registrations that is images
         */
        settings.imageRegistrationTids = [12, 23];

        settings.isObsImage = function(registrationTid) {
            return settings.imageRegistrationTids.filter(function (item) { return item === registrationTid; }).length > 0;
        };

        settings.hasSetAppMode = function() {
            return true && settings.data.appmode;
        };

        settings.getAppMode = function () {
            return settings.data.appmode || 'snow';
        };

        settings.setAppMode = function (mode) {
            settings.data.appmode = mode;
            settings.save();
            $rootScope.$broadcast('$regobs.appModeChanged', mode);
        };

        settings.getWebImageUrl = function (id) {
            return settings.getWebRoot() + 'Picture/image/' + id;
        };

        settings.imageRootFolder = 'picture';
        settings.registrationRootFolder = 'reg';

        settings.getImageRelativePath = function (id) {
            return settings.imageRootFolder + '/' + settings.data.env.replace(/ /g, '') + '/' + id + '.jpg';
        };

        settings.getRegistrationRelativePath = function () {
            return settings.registrationRootFolder + '/' + settings.data.env.replace(/ /g, '') + '/registrations.json';
        };

        settings.getObservationsFromDateISOString = function() {
            return moment().subtract(settings.data.showObservationsDaysBack, 'days').startOf('day').toISOString();
        };

        settings.getCurrentLangKey = function() {
            return 1; //Implement when language support is needed
        };

        settings.load();


        return settings;

    });
