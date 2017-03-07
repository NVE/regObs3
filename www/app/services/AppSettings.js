angular
    .module('RegObs')
    .factory('AppSettings', function (LocalStorage, $http, $log, $rootScope, moment) {

        var settings = this;

        //default Values
        var storageKey = 'regobsAppSettings';
        settings._defaults = {
            env: 'regObs',
            emailReceipt: false,
            compass: false,
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
            showPreviouslyUsedPlaces: false
        };

        var baseUrls = {
            'regObs': 'https://api.nve.no/hydrology/regobs/webapi_v3.1.0',
            'demo regObs': 'https://api.nve.no/hydrology/demo/regobs/webapi',
            'test regObs': 'http://tst-h-web03.nve.no/regobswebapi'
        };

        var serviceUrls = {
            'regObs': 'https://api.nve.no/hydrology/regobs/v3.1.0/',
            'demo regObs' : 'http://stg-h-web03.nve.no/RegObsServices/',
            'test regObs': 'http://tst-h-web03.nve.no/regobsservices_test/'
        };

        var init = function() {
            return $http.get('app/json/secret.json')
                .then(function(response) {
                    var headers = {
                        regObs_apptoken: response.data.apiKey,
                        ApiJsonVersion: '3.1.0'
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
                .catch(function(error) {
                    $log.error('Could not set proper http header settings. Do you have app/json/secret.json with proper app token? ' + JSON.stringify(error));
                });
        };

        settings.maxMapZoomLevel = 17;
        settings.mapFolder = 'maps';
        settings.debugTiles = false; //Turn on to debug offline/fallback/tiles
        settings.maxObservationsToFetch = 1000; //Max observations to fetch from webservice

        settings.tiles = [
            { name: 'topo', description: 'TOPO_MAP_DESCRIPTION', maxDownloadLimit: 1500, avgTileSize: 17248, url: 'http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=matrikkel_bakgrunn&zoom={z}&x={x}&y={y}&format=image/jpeg', embeddedUrl: 'map/topo_{z}_{x}_{y}.jpg', embeddedMaxZoom: 9 },
            { name: 'steepness', description: 'STEEPNESS_MAP_DESCRIPTION', labelTemplate: 'app/map/tilelabels/tilelabelsteepness.html', geoHazardTid: 10, avgTileSize: 4247, url: 'http://gis3.nve.no/arcgis/rest/services/wmts/Bratthet/MapServer/tile/{z}/{y}/{x}' },
            { name: 'ice', description: 'WEAKENED_ICE_MAP_DESCRIPTION', labelTemplate: 'app/map/tilelabels/tilelabelice.html', geoHazardTid: 70, avgTileSize: 1477, url: 'http://gis3.nve.no/arcgis/rest/services/wmts/SvekketIs/MapServer/tile/{z}/{y}/{x}' },
            { name: 'flood', description: 'FLOOD_ZONES_MAP_DESCRIPTION', labelTemplate: 'app/map/tilelabels/tilelabelflood.html', geoHazardTid: 60, avgTileSize: 1230, url: 'http://gis3.nve.no/arcgis/rest/services/wmts/Flomsoner1/MapServer/tile/{z}/{y}/{x}' }
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
                getLocationsWithinRadius: baseUrls[settings.data.env] + '/Location/WithinRadius',
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
            return settings.getEndPoints().services + 'Image/medium/' + id;
            //return settings.getWebRoot() + 'Picture/image/' + id;
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

        settings.getObservationsDaysBack = function() {
            return settings.data.showObservationsDaysBack;
        };

        settings.getCurrentLangKey = function() {
            return 1; //Implement when language support is needed
        };

        settings.getEnvClass = function () {
            return settings.data.env === 'regObs' ? 'bar-dark' : (settings.data.env === 'demo regObs' ? 'bar-assertive' : 'bar-calm');
        };


        init();
        settings.load();

        return settings;

    });
