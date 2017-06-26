angular
    .module('RegObs')
    .factory('Map', function (AppSettings, AppLogging, ObsLocation, Observations, Utility, $state, Registration, $filter, $ionicPlatform, $rootScope, $q, $timeout, $ionicPopup, $interval, RegobsPopup, PresistentStorage, $translate, RegObsClasses, UserLocation) {
        var service = this;

        var map, //Leaflet map
            layerGroups, //Layer groups object
            userMarker, //Leaflet marker for user position
            tiles = []; //Map tiles      

        service._isInitialized = false; //Is map initialized. Map should allways be initialized on startup, else you will get NotInitialized error for alot of methods
        service._isProgramaticZoom = false; //Is currently programatic zoom
        service._zoomToViewOnFirstLocation = 14; //Zoom to this level when first location is found
        service._selectedItem = null; //Map selected item, this could be observations, nearby places or location marker
        service._defaultCenter = [62.5, 10]; //default map center when no observation or user location
        service._followMode = true; //Follow user position, or has user manually dragged or zoomed map?
        service._lastViewBounds = null;
        service._offlinemaps = [];
        service._active = false;
        service._listeners = [];

        /**
         * Set selected item
         * @param {MapSelectableItem} item Item to set as selected
         */
        service._setSelectedItem = function (item) {
            service._unselectAllMarkers(item);
            service._selectedItem = item;
            if (item) {
                if (item.options.setViewOnSelect) {
                    var pos = item.getLatLng();
                    service.disableFollowMode();
                    map.panTo(pos); //pan map to selected item
                }
                service._updateSelectedItemDistance();
            }

            $rootScope.$broadcast('$regObs:mapItemSelected', item);
        };

        /**
         * Update selected item with distance to user position
         */
        service._updateSelectedItemDistance = function () {
            $timeout(function () { //using timout to apply changes to ui
                if (service._selectedItem && UserLocation.hasUserLocation()) {
                    var latlng = service._selectedItem.getLatLng();
                    var distance = UserLocation.getUserDistanceFrom(latlng.lat, latlng.lng);
                    service._selectedItem.setDistance(distance);
                }
            });
        };

        /**
         * On obs location changed
         * @param {L.LatLng} latlng Obs location changed to this position
         */
        service._onObsLocationChange = function (latlng) {
            service._updateSelectedItemDistance();
        };

        /**
         * Unselect all markers
         * @param {MapSelectableItem} except Unselect all except this item
         */
        service._unselectAllMarkers = function (except) {
            var unselectFunc = function (arr) {
                arr.forEach(function (item) {
                    if (item !== except) {
                        if (item.setUnselected) {
                            item.setUnselected();
                        }
                    }
                });
            };
            unselectFunc(layerGroups.observations.getLayers());
        };

        /**
         * Get Marker by id
         * @param {String} id marker id
         * @returns {MapSelectableItem} marker
         */
        service._getMarker = function (id) {
            if (layerGroups && layerGroups.observations) {
                var existingLayers = layerGroups.observations.getLayers().filter(function (item) {
                    if (item.getId) {
                        return item.getId() === id;
                    } else {
                        return false;
                    }
                });
                if (existingLayers.length > 0) {
                    return existingLayers[0];
                }
            }
            return null;
        };

        /**
         * Draw observations stored in presistant storage
         */
        service._drawObservations = function () {
            Observations.getStoredObservations(Utility.getCurrentGeoHazardTid(), true).then(function (result) {
                result.forEach(function (obsJson) {
                    var m = new RegObsClasses.ObservationMarker(obsJson);
                    if (!service._getMarker(m.getId())) {
                        m.on('selected', function (event) { service._setSelectedItem(event.target); });
                        m.addTo(layerGroups.observations);
                    }
                });
            });
            Registration.getNewRegistrations().filter(function (item) {
                return item.GeoHazardTID === Utility.getCurrentGeoHazardTid();
            }).forEach(function (reg) {
                AppLogging.log(JSON.stringify(reg));
                if (reg && reg.ObsLocation && reg.ObsLocation.Latitude && reg.ObsLocation.Longitude) {
                    var m = new RegObsClasses.NewRegistrationMarker(reg);
                    if (!service._getMarker(m.getId())) {
                        m.on('selected', function (event) { service._setSelectedItem(event.target); });
                        m.addTo(layerGroups.observations);
                    }
                }
            });
        };

        /**
         * Remove all observations in map
         */
        service._removeObservations = function () {
            if (layerGroups && layerGroups.observations) {
                layerGroups.observations.clearLayers();
            }
        };

        /**
         * Refresh user position in map
         * @param {object} position User position
         * @returns {void}
         */
        service._refreshUserMarker = function (position) {
            if (position) {
                var latlng = new L.LatLng(position.latitude, position.longitude);
                if (!userMarker) {
                    userMarker = new RegObsClasses.UserMarker(latlng,
                        { accuracy: position.accuracy });
                    userMarker.addTo(layerGroups.user);
                    service.setView(latlng);
                } else {
                    userMarker.setLatLng(latlng);
                    userMarker.setAccuracy(position.accuracy);
                    if (service._followMode) {
                        map.panTo(latlng);
                    }
                }
            }
        };

        /**
         * Remove all tile layers
         * @returns {void} 
         */
        service._removeAllTiles = function () {
            if (angular.isArray(tiles) && layerGroups && layerGroups.tiles) {
                for (var i = 1; i < tiles.length; i++) {
                    layerGroups.tiles.removeLayer(tiles[i]);
                }
            }
        };

        /**
         * Get tile index for tile name
         * @param {string} name Name of tile
         * @returns {number} tile index
         */
        service._getTileIndex = function (name) {
            for (var i = 0; i < AppSettings.tiles.length; i++) {
                if (AppSettings.tiles[i].name === name) {
                    return i;
                }
            }
            return -1;
        };

        /**
         * Get tile by name
         * @param {string} name Name of tile
         * @returns {L.Layer} Tile layer
         */
        service.getTileByName = function (name) {
            var index = service._getTileIndex(name);
            return tiles[index];
        };

        /**
         * Add tile to map
         * @param {string} name Tile name
         * @param {number} opacity Opacity
         * @returns {void} 
         */
        service._addTile = function (name, opacity) {
            if (layerGroups.tiles) {
                var t = service.getTileByName(name);
                if (t) {
                    if (opacity) {
                        t.setOpacity(opacity);
                    }
                    layerGroups.tiles.addLayer(t);
                }
            }
        };

        /**
         * Disable center position to user on updated location
         * @returns {void}
         */
        service.disableFollowMode = function () {
            $timeout(function () {
                service._followMode = false;
            });

        };

        service.getFollowMode = function () {
            return service._followMode;
        };

        /**
         * GPS position updated
         * @param {L.LocationEvent} position Position update
         * @returns {void} 
         */
        service._onPositionUpdate = function (position) {
            UserLocation.setLastUserLocation(position);
            service._refreshUserMarker(position);
            service._updateSelectedItemDistance();
        };


        /**
        * @typedef {Object} LayerGroup
        * @property {L.Layer} tiles Tiles layer group
        * @property {RegObsClasses.MarkerClusterGroup} observations Marker cluster layer group
        * @property {L.LayerGroup} offlinemaps Offline map layer group
        * @property {L.LayerGroup} user User layer group
        */

        /**
         * Create layer groups
         * @param {L.map} mapToAdd Map object
         * @returns {LayerGroup} Layer groups
         */
        service.createLayerGroups = function (mapToAdd) {
            var lg = { //Layers are added in order
                tiles: L.layerGroup().addTo(mapToAdd),
                observations: new RegObsClasses.MarkerClusterGroup({ icon: 'ion-eye' }).addTo(mapToAdd),
                offlinemaps: L.layerGroup().addTo(mapToAdd),
                user: L.layerGroup().addTo(mapToAdd)
            };

            return lg;
        };

        /**
         * Calculate where to center map on startup
         * @returns {array} LatLng
         */
        service._calculateMapStartCenter = function () {
            if (ObsLocation.isSet()) {
                var currentPosition = ObsLocation.get();
                return [currentPosition.Latitude, currentPosition.Longitude];
            }
            if (UserLocation.hasUserLocation()) {
                var userPosition = UserLocation.getLastUserLocation();
                return [userPosition.latitude, userPosition.longitude];
            }
            return service._defaultCenter;
        };

        /**
         * Could location be set manually?
         * @returns {boolean} Is possible to set location manually 
         */
        service._isSetLocationManuallyPossible = function () {
            return Registration.isEmpty() || !ObsLocation.isSet();
        };

        service._updateViewBounds = function () {
            service._lastViewBounds = map.getBounds();
        };


        /**
         * Main method for creating map
         * @param {external:Node} elem Dom element
         * @returns {void} 
         */
        service.createMap = function (elem) {
            userMarker = undefined; //reset if existing
            service._followMode = true;

            var center = service._calculateMapStartCenter();
            map = L.map(elem, {
                center: center,
                zoom: 5,
                maxZoom: AppSettings.maxMapZoomLevel,
                zoomControl: false,
                attributionControl: false
            });

            layerGroups = service.createLayerGroups(map);

            tiles = [];

            AppSettings.tiles.forEach(function (tile) {
                var t = new RegObsClasses.RegObsTileLayer(tile.url, { reuseTiles: false, folder: AppSettings.mapFolder, name: tile.name, embeddedUrl: tile.embeddedUrl, embeddedMaxZoom: tile.embeddedMaxZoom, debugFunc: AppSettings.debugTiles ? AppLogging.debug : null });
                tiles.push(t);
            });
            tiles[0].addTo(layerGroups.tiles);

            map.on('locationfound', service._onPositionUpdate);

            map.on('locationerror',
                function (e) {
                    AppLogging.log('GPS error: ' + e.message);
                });

            map.on('click', service.clearSelectedMarkers);

            map.on('dragstart', function () {
                if (userMarker) { //Only disable follow mode on map drag if first location has been set (userMarker exists)
                    service.disableFollowMode();
                }
            });
            map.on('zoomstart', function () {
                if (!service._isProgramaticZoom && userMarker) {
                    service.disableFollowMode();
                }
            });

            map.on('dragend', service._updateViewBounds);
            map.on('zoomend', function () {
                service._isProgramaticZoom = false;
                service._updateViewBounds();
            });

            L.control.scale({ imperial: false }).addTo(map);

            service._listeners.push($rootScope.$on('$regObs:registrationSaved', function () {
                service.refresh();
            }));

            service._listeners.push($rootScope.$on('$regObs:appSettingsChanged', function () {
                service.refresh();
            }));

            service._listeners.push($rootScope.$on('$regObs:registrationReset', function () {
                $timeout(function () {
                    service.clearSelectedMarkers();
                });
            }));

            service._listeners.push($rootScope.$on('$regObs:observationsUpdated', function () {
                service.refresh();
            }));

            service._isInitialized = true; //map is created!

            service._updateViewBounds();
            service.refresh();

            if (UserLocation.hasUserLocation()) {
                service._onPositionUpdate(UserLocation.getLastUserLocation());
            } else if (ObsLocation.isSet()) {
                service.setView(L.latLng(ObsLocation.get().Latitude, ObsLocation.get().Longitude));
            }

            return map;
        };

        service.reset = function () {
            service._listeners.forEach(function (item) {
                item(); //unregister listener
            });
            service._listeners = [];
            userMarker = undefined;

            if (map) {
                map.off();
                map.remove();
                map = undefined;
            }
            service._isInitialized = false;
        };

        /**
         * Clear selected marker
         * @returns {void} 
         */
        service.clearSelectedMarkers = function () {
            service._unselectAllMarkers();
            service._setSelectedItem(null);
        };

        /**
         * Set view and zoom to level
         * @param {L.LatLng} latlng Set view to this lat lng coordinate
         * @param {number} zoom  Set zoom. If empty use default map zoom.
         * @returns {void} 
         */
        service.setView = function (latlng, zoom) {
            service._isProgramaticZoom = true;
            if (map) {
                map.setView(latlng, zoom || service._zoomToViewOnFirstLocation);
            }
        };

        /**
        * Pan to lat lng without zooming
        * @param {L.LatLng} latlng Coordinate to pan to (no zooming).
        * @returns {void}
        */
        service.panTo = function (latlng) {
            if (map) {
                map.panTo(latlng);
            }
        };

        /**
        * Fly to lat lng position (smoother animation)
        * @param {L.LatLng} latlng Coordinate to fly to
        * @param {number} zoom Zoom to this level when fly in.
        * @returns {void}
        */
        service.flyTo = function (latlng, zoom) {
            service._isProgramaticZoom = true;
            if (map) {
                map.flyTo(latlng, zoom || service._zoomToViewOnFirstLocation);
            }
        };


        /**
         * Get center of map
         * @returns {void} 
         */
        service.getCenter = function () {
            return map.getCenter();
        };

        /**
         * Get map zoom
         * @returns {number} Map zoom level 
         */
        service.getZoom = function () {
            if (!map) return service._zoomToViewOnFirstLocation;
            return map.getZoom();
        };

        /**
         * Get all tiles
         * @returns {Array<RegObsClasses.RegObsTileLayer>} Array of tiles layers
         */
        service.getTiles = function () {
            return tiles;
        };

        /**
         * Set follow mode and center map to user position
         * @returns {void}
         */
        service.centerMapToUser = function () {
            service._followMode = true;
            if (userMarker && map) {
                var currentZoom = service.getZoom();
                if (currentZoom < service._zoomToViewOnFirstLocation) { //Only zoom in if zoom is less than default user zoom
                    service.setView(userMarker.getLatLng());
                } else {
                    map.panTo(userMarker.getLatLng());
                }
            }
        };

        service.getSearchRadius = function (map) {
            var bounds = map.getBounds();
            var radius = Utility.getRadiusFromBounds(bounds);
            var settingsRaduis = AppSettings.data.searchRange;
            if (settingsRaduis > radius) {
                radius = settingsRaduis;
            }
            return radius;
        };


        /**
         * Update observation tat is stored in presistant storage
         * @returns {promise} Download observations promise 
         */
        service.updateObservationsInMap = function () {
            if (!map) throw new Error('Map not initialized!');

            var center = map.getCenter();
            var radius = service.getSearchRadius(map);
            var geoHazardTid = Utility.getCurrentGeoHazardTid();

            service.clearSelectedMarkers();
            var workFunc = function (onProgress, cancel) {
                return Observations.updateObservationsWithinRadius(center.lat,
                    center.lng,
                    radius,
                    geoHazardTid,
                    onProgress,
                    cancel);
            };

            ////Turn on observations and nearby places when updated from map (youtrack: rOa-40)
            //if (!AppSettings.data.showObservations || !AppSettings.data.showPreviouslyUsedPlaces) {
            //    AppSettings.data.showObservations = true;
            //    AppSettings.data.showPreviouslyUsedPlaces = true;
            //    AppSettings.save();
            //}

            return RegobsPopup.downloadProgress('UPDATE_MAP_OBSERVATIONS', workFunc, { longTimoutMessageDelay: 20, closeOnComplete: true });
        };

        /**
         * Is position within map bounds?
         * @param {number} lat  Latitude
         * @param {number} lng Longitude
         * @returns {boolean} True if position is within view bounds 
         */
        service.isPositionWithinMapBounds = function (lat, lng) {
            if (service._lastViewBounds && lat && lng) {
                var latLng = L.latLng(lat, lng);
                return service._lastViewBounds.contains(latLng);
            }
            return false;
        };

        service.getLastViewBounds = function () {
            return service._lastViewBounds;
        };

        /**
         * Redraw map with tiles only visible for current geohazard
         * @returns {void} 
         */
        service._redrawTilesForThisGeoHazard = function () {
            service._removeAllTiles();

            var geoId = Utility.getCurrentGeoHazardTid();
            AppSettings.data.maps.forEach(function (mapSetting) {
                if (mapSetting.geoHazardTid === geoId) {
                    if (mapSetting.tiles) {
                        mapSetting.tiles.forEach(function (tileSetting) {
                            if (tileSetting.visible) {
                                service._addTile(tileSetting.name, tileSetting.opacity);
                            }
                        });
                    }
                }
            });
        };

        /**
         * Check if selected marker should med unselected if geohazard settings has been changed
         * @returns {void} 
         */
        service._checkSelectedItemGeoHazard = function () {
            if (service._selectedItem && service._selectedItem.getGeoHazardId() !== Utility.getCurrentGeoHazardTid()) {
                service.clearSelectedMarkers();
            }
        };


        service.setOfflineAreaBounds = function (offlineMapsBoundsArray) {
            if (!angular.isArray(offlineMapsBoundsArray)) throw Error('offlineMapsBoundsArray must be an array!');
            service._offlinemaps = offlineMapsBoundsArray;
            service._redrawOfflineMapLines();
        };

        service._redrawOfflineMapLines = function () {
            if (layerGroups.offlinemaps) {
                layerGroups.offlinemaps.clearLayers();
                service._offlinemaps.forEach(function (item) {
                    var bounds = L.latLngBounds(item);
                    var polygon = L.polygon([bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthEast(), bounds.getSouthWest()], { color: "#ff7800", weight: 2, fill: false }).addTo(layerGroups.offlinemaps);
                });
            }
        };

        /**
         * Refresh map an redraw layers and markers as set in settings
         * @returns {void} 
         */
        service.refresh = function () {
            AppLogging.log('Map refresh');

            service._checkSelectedItemGeoHazard();
            service._redrawTilesForThisGeoHazard();
            service._redrawOfflineMapLines();

            Registration.clearExistingNewRegistrations()
                .then(function () {
                    service._removeObservations(); //clear all markers
                    if (AppSettings.data.showObservations) {
                        service._drawObservations();
                    }
                    service.invalidateSize();
                });
        };

        /**
         * Start watching gps position
         * @returns {void} 
         */
        service.startWatch = function () {
            if (map) {
                document.addEventListener("deviceready",
                    function () {
                        AppLogging.log('Start watching gps location');
                        map.locate({ watch: true, enableHighAccuracy: true });
                    },
                    false);

                if (userMarker) {
                    userMarker.watchHeading();
                }

                service._active = true;
            }
        };

        /**
         * Clear gps position watch
         * @returns {void} 
         */
        service.clearWatch = function () {
            if (map) {
                AppLogging.log('Stop watching gps location');
                map.stopLocate();
            }
            if (userMarker) {
                userMarker.clearHeadingWatch();
            }

            service._active = false;
        };

        service._isMapVisisble = function () {
            return $state.current.name === 'start';
        };

        /**
         * Invalidate map size (redraws map)
         * @returns {void} 
         */
        service.invalidateSize = function () {
            if (map && service._isMapVisisble()) {
                map.invalidateSize();
            }
        };

        /**
         * Calculate list of xyz map pieces that is needed for current bounds
         * @param {L.LatLngBounds} bounds Bounds to calculate from
         * @param {number} zoomMin Min zoom level
         * @param {number} zoomMax Max zoom level
         * @returns {Array} xyz list
         */
        service.calculateXYZListFromBounds = function (bounds, zoomMin, zoomMax) {
            if (!tiles) return [];
            return tiles[0].calculateXYZListFromBounds(bounds, zoomMin, zoomMax);
        };

        /**
         * Calculate size of all map pieces that is needed for current bounds
         * @param {L.LatLngBounds} bounds Bounds to calculate from
         * @param {number} zoomMin Min zoom level
         * @param {number} zoomMax Max zoom level
         * @returns {number} Number of tiles
         */
        service.calculateXYZSizeFromBounds = function (bounds, zoomMin, zoomMax) {
            if (!map || !tiles) return 0;
            return tiles[0].calculateXYZSizeFromBounds(bounds, zoomMin, zoomMax);
        };


        /**
         * Get all observations that is within view bounds of map
         * @returns {Array<RegObsClasses.Observation>} Array of observations
         */
        service.getObservationsWithinViewBounds = function () {
            return Observations.getStoredObservations(Utility.getCurrentGeoHazardTid(), true)
                .then(function (result) {
                    var items = [];
                    result.forEach(function (obsJson) {
                        var o = new RegObsClasses.Observation(obsJson);
                        if (service.isPositionWithinMapBounds(o.Latitude, o.Longitude)) {
                            items.push(o);
                        }
                    });
                    return items;
                });
        };

        return service;
    });