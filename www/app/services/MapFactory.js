angular
    .module('RegObs')
    .factory('Map', function (AppSettings, AppLogging, ObsLocation, Observations, Utility, $state, Registration, $ionicPlatform, $rootScope, $q, $timeout, $ionicPopup, $interval, RegobsPopup, PresistentStorage, $translate, RegObsClasses, UserLocation) {
        var service = this;

        var map, //Leaflet map
            layerGroups, //Layer groups object
            obsLocationMarker, //Leaflet marker for current obs location
            userMarker, //Leaflet marker for user position
            pathLine, //Leaflet (dotted) path between user position and current obs location
            observationInfo, //Obs location information. Displayed on top right corner
            tiles = []; //Map tiles      

        service._isInitialized = false; //Is map initialized. Map should allways be initialized on startup, else you will get NotInitialized error for alot of methods
        service._isProgramaticZoom = false, //Is currently programatic zoom
        service._zoomToViewOnFirstLocation = 13; //Zoom to this level when first location is found
        service._selectedItem = null; //Map selected item, this could be observations, nearby places or location marker
        service._defaultCenter = [62.5, 10]; //default map center when no observation or user location
        service._followMode = true; //Follow user position, or has user manually dragged or zoomed map?

        /**
         * Check if map is initialized, else throw error
         * @throws {Error} when not initialized
         */
        service._checkIfInitialized = function () {
            if (!service._isInitialized)
                throw Error('Map is not initialized! Please call createMap functon on map element...');
        };

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
                    service._disableFollowMode();
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
         * Update info text with distance from user to observation
         * @param {L.LatLng} latlng Position to update distence to from user
         */
        service._updateObsInfoText = function (latlng) {
            service._checkIfInitialized();
            var text = '';
            if (latlng && UserLocation.hasUserLocation()) {
                var distance = UserLocation.getUserDistanceFrom(latlng.lat, latlng.lng);
                if (distance.valid) {
                    text = distance.description;
                }
            } else if (UserLocation.hasUserLocation() && !latlng) {
                text = '0m';
            } else if (!ObsLocation.isSet()) {
                text = $translate.instant('NOT_SET');
            }
            observationInfo.setText(text);
        };

        /**
         * On obs location changed
         * @param {L.LatLng} latlng Obs location changed to this position
         */
        service._onObsLocationChange = function (latlng) {
            service._updateObsInfoText(latlng);
            service._updateDistanceLineLatLng(latlng);
            service._updateSelectedItemDistance();
        };

        /**
         * Unselect all markers
         * @param {MapSelectableItem} exept Unselect all except this item
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
            unselectFunc(layerGroups.locations.getLayers());
            unselectFunc([obsLocationMarker]);
        };

        /**
         * Draw observations stored in presistant storage
         */
        service._drawObservations = function () {
            layerGroups.observations.clearLayers();
            Observations.getStoredObservations(Utility.getCurrentGeoHazardTid()).then(function (result) {
                result.forEach(function (obsJson) {
                    var m = new RegObsClasses.ObservationMarker(obsJson);
                    m.on('selected', function (event) { service._setSelectedItem(event.target); });
                    m.addTo(layerGroups.observations);
                });
            });
        };

        /**
         * Remove all observations in map
         */
        service._removeObservations = function () {
            service._checkIfInitialized();
            layerGroups.observations.clearLayers();
        };

        /**
         * Draw locations stored in presistant storage as stored location markers
         * @returns {} 
         */
        service._drawStoredLocations = function () {
            service._checkIfInitialized();
            service._clearAllStoredLocations();
            Observations.getLocations(Utility.getCurrentGeoHazardTid()).forEach(function (loc) {
                var m = new RegObsClasses.StoredLocationMarker(loc);
                m.on('selected', function (event) { service._setSelectedItem(event.target); });
                m.addTo(layerGroups.locations);
            });
        };

        /**
         * Hide all stored locations
         * @returns {} 
         */
        service._clearAllStoredLocations = function () {
            service._checkIfInitialized();
            layerGroups.locations.clearLayers();
        };


        /**
         * Set obs location
         * @param {} latlng 
         * @returns {} 
         */
        service._setObsLocation = function (latlng) {
            service._checkIfInitialized();
            if (latlng) {
                obsLocationMarker.setObsLocationManually(latlng);
                obsLocationMarker.setSelected();
            }
        };

        /**
         * Update distance path line
         * @param {} latlng 
         * @returns {} 
         */
        service._updateDistanceLineLatLng = function (latlng) {
            if (userMarker && latlng) {
                var path = [latlng, userMarker.getLatLng()];
                if (!pathLine) {
                    pathLine = L.polyline(path, { color: 'black', weight: 6, opacity: .5, dashArray: "10,10" })
                        .addTo(layerGroups.user);
                } else {
                    pathLine.setLatLngs(path);
                }
            }
        };

        /**
         * Refresh user position in map
         * @param {} position 
         * @returns {} 
         */
        service._refreshUserMarker = function (position) {
            if (position) {
                var latlng = new L.LatLng(position.latitude, position.longitude);
                if (!userMarker) {
                    userMarker = L.userMarker(latlng,
                        { pulsing: true, accuracy: position.accuracy, smallIcon: true, zIndexOffset: 1000 });
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
         * @returns {} 
         */
        service._removeAllTiles = function () {
            service._checkIfInitialized();
            for (var i = 1; i < tiles.length; i++) {
                layerGroups.tiles.removeLayer(tiles[i]);
            }
        };

        /**
         * Get tile index for tile name
         * @param {} name 
         * @returns {} 
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
         * @param {} name 
         * @returns {} 
         */
        service.getTileByName = function (name) {
            var index = service._getTileIndex(name);
            return tiles[index];
        };

        /**
         * Add tile to map
         * @param {} name 
         * @param {} opacity 
         * @returns {} 
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
         * @returns {} 
         */
        service._disableFollowMode = function () {
            service._followMode = false;
        };

        /**
         * GPS position updated
         * @param {} position 
         * @returns {} 
         */
        service._onPositionUpdate = function (position) {
            UserLocation.setLastUserLocation(position);
            service._refreshUserMarker(position);
            var latlng = new L.LatLng(position.latitude, position.longitude);
            obsLocationMarker.setUserPosition(latlng);
            service._updateSelectedItemDistance();
            if (ObsLocation.isSet()) {
                var obslatlng = new L.LatLng(ObsLocation.get().Latitude, ObsLocation.get().Longitude);
                service._updateObsInfoText(obslatlng);
                service._updateDistanceLineLatLng(obslatlng);
            }
        };

        /**
         * Event that runs when obsLocation is cleared
         * @returns {} 
         */
        service._onObsLocationCleared = function () {
            service.clearSelectedMarkers();
            if (pathLine) {
                layerGroups.user.removeLayer(pathLine);
                pathLine = null;
            }
        };

        /**
         * Create layer groups
         * @returns {} 
         */
        service._createLayerGroups = function () {
            layerGroups = { //Layers are added in order
                tiles: L.layerGroup().addTo(map),
                locations: new RegObsClasses.MarkerClusterGroup({ icon: 'ion-pin' }).addTo(map),
                observations: new RegObsClasses.MarkerClusterGroup({ icon: 'ion-eye' }).addTo(map),
                user: L.layerGroup().addTo(map)
            };
        };

        /**
         * Calculate where to center map on startup
         * @returns {} 
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
         * Main method for creating map
         * @param {} elem 
         * @returns {} 
         */
        service.createMap = function (elem) {
            var center = service._calculateMapStartCenter();
            map = L.map(elem, {
                center: center,
                zoom: 5,
                maxZoom: AppSettings.maxMapZoomLevel,
                zoomControl: false,
                attributionControl: false
            });

            service._createLayerGroups();

            tiles = [];

            AppSettings.tiles.forEach(function (tile) {
                var t = L.tileLayerRegObs(tile.url, { folder: AppSettings.mapFolder, name: tile.name, debugFunc: AppSettings.debugTiles ? AppLogging.debug : null });
                tiles.push(t);
            });
            tiles[0].addTo(layerGroups.tiles);

            observationInfo = L.obsLocationInfo().addTo(map);

            map.on('locationfound', service._onPositionUpdate);

            map.on('locationerror',
                function (e) {
                    AppLogging.log('GPS error: ' + e.message);
                });

            map.on('contextmenu', function (e) {
                service._setObsLocation(e.latlng); //Set location manually on right klick / long press in map
            });

            map.on('click', service.clearSelectedMarkers);

            map.on('dragstart', function () {
                if (userMarker) { //Only disable follow mode on map drag if first location has been set (userMarker exists)
                    service._disableFollowMode();
                }
            });
            map.on('zoomstart', function () {
                if (!service._isProgramaticZoom && userMarker) {
                    service._disableFollowMode();
                }
            });

            obsLocationMarker = new RegObsClasses.CurrentObsLocationMarker(center);
            obsLocationMarker.on('selected', function (event) { service._setSelectedItem(event.target); });
            obsLocationMarker.on('obsLocationChange', service._onObsLocationChange);
            obsLocationMarker.on('drag', function (event) {
                service._onObsLocationChange(event.latlng);
            });

            obsLocationMarker.on('obsLocationCleared', service._onObsLocationCleared);
            obsLocationMarker.addTo(layerGroups.user);

            service._isInitialized = true; //map is created!

            service.refresh();

            if (UserLocation.hasUserLocation()) {
                service._onPositionUpdate(UserLocation.getLastUserLocation());
            }else if (ObsLocation.isSet()) {
                service.setView(L.latLng(ObsLocation.get().Latitude, ObsLocation.get().Longitude));
            }

            return map;
        };

        /**
        * Remove current set obs location
        * @returns {} 
        */
        service.clearObsLocation = function () {
            obsLocationMarker.clear();
        };

        /**
         * Clear selected marker
         * @returns {} 
         */
        service.clearSelectedMarkers = function () {
            service._unselectAllMarkers();
            service._setSelectedItem(null);
        };

        /**
         * Set view and zoom to level
         * @param {} latlng 
         * @param {} zoom 
         * @returns {} 
         */
        service.setView = function (latlng, zoom) {
            service._isProgramaticZoom = true;
            map.setView(latlng, zoom || service._zoomToViewOnFirstLocation);
            service._isProgramaticZoom = false;
        };

        /**
         * Get center of map
         * @returns {} 
         */
        service.getCenter = function () {
            return map.getCenter();
        };

        /**
         * Get map zoom
         * @returns {} 
         */
        service.getZoom = function () {
            return map.getZoom();
        };

        /**
         * Get all tiles
         * @returns {} 
         */
        service.getTiles = function () {
            return tiles;
        };

        /**
         * Set follow mode and center map to user position
         * @returns {} 
         */
        service.centerMapToUser = function () {
            service._followMode = true;
            if (userMarker) {
                if (map) {
                    map.panTo(userMarker.getLatLng());
                }
            }
        };

        /**
         * Get map search observations radius
         * @returns {} 
         */
        service._getObservationSearchRadius = function () {
            var bounds = map.getBounds();
            var radius = parseInt((bounds.getNorthWest().distanceTo(bounds.getSouthEast()) / 2).toFixed(0));
            var settingsRaduis = AppSettings.data.searchRange;
            if (settingsRaduis > radius) {
                radius = settingsRaduis;
            }
            return radius;
        };

        /**
         * Update observation tat is stored in presistant storage
         * @returns {} 
         */
        service.updateObservationsInMap = function () {
            if (map) {
                var center = map.getCenter();
                var radius = service._getObservationSearchRadius();
                var geoHazardTid = Utility.getCurrentGeoHazardTid();

                var workFunc = function (onProgress, cancel) {
                    return Observations
                        .updateObservationsWithinRadius(center.lat,
                            center.lng,
                            radius,
                            geoHazardTid,
                            new RegObs.ProggressStatus(),
                            onProgress,
                            cancel);
                };

                RegobsPopup.downloadProgress('Oppdaterer kartet med det siste fra regObs',
                    workFunc,
                    { longTimoutMessageDelay: 10, closeOnComplete: true })
                .then(function () {
                    AppLogging.log('progress completed');
                })
                .catch(function () {
                    AppLogging.log('progress cancelled');
                })
                .finally(service.refresh);
            }
        };

        /**
         * Redraw map with tiles only visible for current geohazard
         * @returns {} 
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
         * Refresh map an redraw layers and markers as set in settings
         * @returns {} 
         */
        service.refresh = function () {
            service._redrawTilesForThisGeoHazard();

            if (AppSettings.data.showPreviouslyUsedPlaces) {
                service._drawStoredLocations();
            } else {
                service._clearAllStoredLocations();
            }
            if (AppSettings.data.showObservations) {
                service._drawObservations();
            } else {
                service._removeObservations();
            }
            service.invalidateSize();
        };

        /**
         * Start watching gps position
         * @returns {} 
         */
        service.startWatch = function () {
            if (map) {
                AppLogging.log('Start watching gps location');
                $ionicPlatform.ready(function () {
                    map.locate({ watch: true, enableHighAccuracy: true });
                });

                //document.addEventListener("deviceready",
                //    function () {
                //        map.locate({ watch: true, enableHighAccuracy: true });
                //    },
                //    false);
            }
        };

        /**
         * Clear gps position watch
         * @returns {} 
         */
        service.clearWatch = function () {
            if (map) {
                AppLogging.log('Stop watching gps location');
                map.stopLocate();
            }
        };

        /**
         * Invalidate map size (redraws map)
         * @returns {} 
         */
        service.invalidateSize = function () {
            if (map) {
                map.invalidateSize();
            }
        };

        /**
         * Calculate list of xyz map pieces that is needed for current bounds
         * @param {} bounds 
         * @param {} zoomMin 
         * @param {} zoomMax 
         * @returns {} 
         */
        service.calculateXYZListFromBounds = function (bounds, zoomMin, zoomMax) {
            if (!tiles) return [];
            return tiles[0].calculateXYZListFromBounds(bounds, zoomMin, zoomMax);
        };

        /**
         * Calculate size of all map pieces that is needed for current bounds
         * @param {} bounds 
         * @param {} zoomMin 
         * @param {} zoomMax 
         * @returns {} 
         */
        service.calculateXYZSizeFromBounds = function (bounds, zoomMin, zoomMax) {
            if (!map || !tiles) return 0;
            return tiles[0].calculateXYZSizeFromBounds(bounds, zoomMin, zoomMax);
        };

        return service;
    });