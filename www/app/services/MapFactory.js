angular
    .module('RegObs')
    .factory('Map', function (AppSettings, AppLogging, ObsLocation, Observations, Utility, $state, Registration, $filter, $ionicPlatform, $rootScope, $q, $timeout, $ionicPopup, $interval, RegobsPopup, PresistentStorage, $translate, RegObsClasses, UserLocation) {
        var service = this;

        var map, //Leaflet map
            layerGroups, //Layer groups object
            //obsLocationMarker, //Leaflet marker for current obs location
            userMarker, //Leaflet marker for user position
            //pathLine, //Leaflet (dotted) path between user position and current obs location
            //observationInfo, //Obs location information. Displayed on top right corner
            tiles = []; //Map tiles      

        service._isInitialized = false; //Is map initialized. Map should allways be initialized on startup, else you will get NotInitialized error for alot of methods
        service._isProgramaticZoom = false, //Is currently programatic zoom
        service._zoomToViewOnFirstLocation = 14; //Zoom to this level when first location is found
        service._selectedItem = null; //Map selected item, this could be observations, nearby places or location marker
        service._defaultCenter = [62.5, 10]; //default map center when no observation or user location
        service._followMode = true; //Follow user position, or has user manually dragged or zoomed map?
        service._lastViewBounds = null;
        service._offlinemaps = [];
        service._active = false;


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

        ///**
        // * Update info text with distance from user to observation
        // * @param {L.LatLng} latlng Position to update distence to from user
        // */
        //service._updateObsInfoText = function (latlng) {
        //    service._checkIfInitialized();
        //    var text = '';
        //    if (latlng && UserLocation.hasUserLocation()) {
        //        var distance = UserLocation.getUserDistanceFrom(latlng.lat, latlng.lng);
        //        if (distance.valid) {
        //            text = distance.description;
        //        }
        //    } else if (UserLocation.hasUserLocation() && !latlng) {
        //        text = '0m';
        //    } else if (!ObsLocation.isSet()) {
        //        text = $translate.instant('NOT_SET');
        //    }
        //    observationInfo.setText(text);
        //};

        /**
         * On obs location changed
         * @param {L.LatLng} latlng Obs location changed to this position
         */
        service._onObsLocationChange = function (latlng) {
            //service._updateObsInfoText(latlng);
            //service._updateDistanceLineLatLng(latlng);
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
        };

        /**
         * Get Marker by id
         * @param {String} id 
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
            service._checkIfInitialized();
            layerGroups.observations.clearLayers();
        };

        ///**
        // * Draw locations stored in presistant storage as stored location markers
        // */
        //service._drawStoredLocations = function () {
        //    service._checkIfInitialized();
        //    Observations.getLocations(Utility.getCurrentGeoHazardTid()).forEach(function (loc) {
        //        var m = new RegObsClasses.StoredLocationMarker(loc);
        //        m.on('selected', function (event) { service._setSelectedItem(event.target); });
        //        m.addTo(layerGroups.observations);
        //    });
        //};


        ///**
        // * Set obs location
        // * @param {L.LatLng} latlng
        // */
        //service._setObsLocation = function (latlng) {
        //    service._checkIfInitialized();
        //    if (latlng) {
        //        obsLocationMarker.setObsLocationManually(latlng);
        //        obsLocationMarker.setSelected();
        //    }
        //};

        ///**
        // * Update distance path line
        // * @param {L.LatLng} latlng
        // */
        //service._updateDistanceLineLatLng = function (latlng) {
        //    if (userMarker && latlng) {
        //        var path = [latlng, userMarker.getLatLng()];
        //        if (!pathLine) {
        //            pathLine = L.polyline(path, { color: 'black', weight: 6, opacity: .5, dashArray: "10,10" })
        //                .addTo(layerGroups.user);
        //        } else {
        //            pathLine.setLatLngs(path);
        //        }
        //    }
        //};

        /**
         * Refresh user position in map
         * @param {} position 
         * @returns {} 
         */
        service._refreshUserMarker = function (position) {
            if (position) {
                var latlng = new L.LatLng(position.latitude, position.longitude);
                if (!userMarker) {
                    userMarker = new RegObsClasses.UserMarker(latlng,
                        { accuracy: position.accuracy, zIndexOffset: 1000 });
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
            $timeout(function () {
                service._followMode = false;
            });

        };

        service.getFollowMode = function () {
            return service._followMode;
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
            //obsLocationMarker.setUserPosition(latlng);
            service._updateSelectedItemDistance();
            //if (ObsLocation.isSet()) {
            //    var obslatlng = new L.LatLng(ObsLocation.get().Latitude, ObsLocation.get().Longitude);
            //    service._updateDistanceLineLatLng(obslatlng);
            //}
        };

        ///**
        // * Event that runs when obsLocation is cleared
        // * @returns {} 
        // */
        //service._onObsLocationCleared = function () {
        //    service.clearSelectedMarkers();
        //    if (pathLine) {
        //        layerGroups.user.removeLayer(pathLine);
        //        pathLine = null;
        //    }
        //};

        /**
         * Create layer groups
         * @returns {} 
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
         * Could location be set manually?
         * @returns {} 
         */
        service._isSetLocationManuallyPossible = function () {
            return Registration.isEmpty() || !ObsLocation.isSet();
        };

        service._updateViewBounds = function () {
            service._lastViewBounds = map.getBounds();
        };


        service._goToNewRegistrationDetails = function () {
            if (service._goToNewRegistrationOnUpdate && service._goToNewRegistrationOnUpdate.ObsLocation) {
                Observations.getStoredObservations(Utility.getCurrentGeoHazardTid())
                    .then(function (result) {
                        var orderedResult = $filter('orderBy')(result, 'DtObsTime');
                        var navigateTo = null;
                        orderedResult.forEach(function (obs) {
                            if (!navigateTo) {
                                if (obs.LocationId && service._goToNewRegistrationOnUpdate.ObsLocation.ObsLocationId && obs.LocationId === service._goToNewRegistrationOnUpdate.ObsLocation.ObsLocationId) {
                                    navigateTo = obs;
                                } else {
                                    var distance = L.latLng(obs.Latitude, obs.Longitude).distanceTo(L.latLng(service._goToNewRegistrationOnUpdate.ObsLocation.Latitude, service._goToNewRegistrationOnUpdate.ObsLocation.Longitude));
                                    if (distance < 10) { //TODO: use registration ID instead of distance and location when RegId is returned from new registration POST
                                        navigateTo = obs;
                                    }
                                }
                            }
                        });
                        service._goToNewRegistrationOnUpdate = null;
                        if (navigateTo != null) {
                            $state.go('observationdetails', { observation: RegObsClasses.Observation.fromJson(navigateTo) });
                        }
                    });
            }
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

            layerGroups = service.createLayerGroups(map);

            tiles = [];

            AppSettings.tiles.forEach(function (tile) {
                var t = new RegObsClasses.RegObsTileLayer(tile.url, { reuseTiles: false, folder: AppSettings.mapFolder, name: tile.name, embeddedUrl: tile.embeddedUrl, embeddedMaxZoom: tile.embeddedMaxZoom, debugFunc: AppSettings.debugTiles ? AppLogging.debug : null });
                tiles.push(t);
            });
            tiles[0].addTo(layerGroups.tiles);

            //observationInfo = L.obsLocationInfo().addTo(map);

            map.on('locationfound', service._onPositionUpdate);

            map.on('locationerror',
                function (e) {
                    AppLogging.log('GPS error: ' + e.message);
                });

            //map.on('contextmenu', function (e) {
            //    if (service._isSetLocationManuallyPossible()) {
            //        service._setObsLocation(e.latlng); //Set location manually on right klick / long press in map if no registration present
            //    }
            //});

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

            map.on('dragend', service._updateViewBounds);
            map.on('zoomend', function () {
                service._isProgramaticZoom = false;
                service._updateViewBounds();
            });


            //obsLocationMarker = new RegObsClasses.CurrentObsLocationMarker(center);
            //obsLocationMarker.on('selected', function (event) { service._setSelectedItem(event.target); });
            //obsLocationMarker.on('obsLocationChange', service._onObsLocationChange);

            //obsLocationMarker.on('obsLocationCleared', service._onObsLocationCleared);
            //obsLocationMarker.addTo(layerGroups.user);

            L.control.scale({ imperial: false }).addTo(map);

            $rootScope.$on('$regObs:registrationSaved', function () {
                //if (service._active) {
                    service.refresh();
                    $timeout(function () {
                        map.invalidateSize(); //Footer bar could have been removed, invalidate map size
                    }, 50);
                //}
            });

            $rootScope.$on('$regObs:appSettingsChanged', function () {
                service.refresh();
            });

            $rootScope.$on('$regObs:registrationReset', function () {
                $timeout(function () {
                    service.clearSelectedMarkers();
                });
            });

            //$rootScope.$on('$regObs:obsLocationSaved', function () {
            //    obsLocationMarker.refresh();
            //});

            //$rootScope.$on('$regObs:nearbyLocationRegistration', function () {
            //    $timeout(function () {
            //        service._setSelectedItem(obsLocationMarker);
            //    });
            //});

            $rootScope.$on('$regObs:observationsUpdated', function () {
                service.refresh();

                if (service._goToNewRegistrationOnUpdate) {
                    service._goToNewRegistrationDetails();
                }
            });

            $rootScope.$on('$regObs:updateObservations', function (event, item) {
                if (item) {
                    service._goToNewRegistrationOnUpdate = item;
                }
                service.updateObservationsInMap();
            });

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

        ///**
        //* Remove current set obs location
        //* @returns {} 
        //*/
        //service.clearObsLocation = function () {
        //    obsLocationMarker.clear();
        //};

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
            if (!map) return service._zoomToViewOnFirstLocation;
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
            if (userMarker && map) {
                var currentZoom = service.getZoom();
                if (currentZoom < service._zoomToViewOnFirstLocation) { //Only zoom in if zoom is less than default user zoom
                    service.setView(userMarker.getLatLng());
                } else {
                    map.panTo(userMarker.getLatLng());
                }
            }
        };

        /**
         * Update observation tat is stored in presistant storage
         * @returns {} 
         */
        service.updateObservationsInMap = function () {
            if (!map) throw new Error('Map not initialized!');

            var center = map.getCenter();
            var radius = Utility.getSearchRadius(map);
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
         * @param {} lat 
         * @param {} lng 
         * @returns {} 
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
         * Check if selected marker should med unselected if geohazard settings has been changed
         * @returns {} 
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
         * @returns {} 
         */
        service.refresh = function () {
            AppLogging.log('Map refresh');

            //if (!ObsLocation.isSet() && service._selectedItem && service._selectedItem === obsLocationMarker) {
            //    service.clearSelectedMarkers();
            //}

            service._checkSelectedItemGeoHazard();
            service._redrawTilesForThisGeoHazard();
            service._redrawOfflineMapLines();

            Registration.clearNewRegistrationsWithinRange()
                .then(function () {
                    service._removeObservations(); //clear all markers
                    //if (AppSettings.data.showPreviouslyUsedPlaces) {
                    //    service._drawStoredLocations();
                    //}
                    if (AppSettings.data.showObservations) {
                        service._drawObservations();
                    }
                    service.invalidateSize();
                });
        };

        /**
         * Start watching gps position
         * @returns {} 
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
         * @returns {} 
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
         * @param {} zoomMax ref
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


        /**
         * Get all observations that is within view bounds of map
         * @returns {} 
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