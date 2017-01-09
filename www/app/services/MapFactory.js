angular
    .module('RegObs')
    .factory('Map', function (AppSettings, AppLogging, ObsLocation, Observations, Utility, $state, Registration, $ionicPlatform, $rootScope, $q, $timeout, $ionicPopup, $interval, RegobsPopup, PresistentStorage, $translate) {
        var service = this;
        var map, //Leaflet map
            layerGroups, //Layer groups object
            obsLocationMarker, //Leaflet marker for current obs location
            userMarker, //Leaflet marker for user position
            pathLine, //Leaflet (dotted) path between user position and current obs location
            observationInfo, //Obs location information. Displayed on top right corner
            isDragging = false, //is user currently dragging map?
            tiles = [], //Map tiles
            isProgramaticZoom = false, //Is currently programatic zoom
            followMode = true, //Follow user position, or has user manually dragged or zoomed map?
            icon = L.AwesomeMarkers.icon({ icon: 'arrow-move', prefix: 'ion', markerColor: 'green', extraClasses: 'map-obs-marker' }),
            iconSet = L.AwesomeMarkers.icon({ icon: 'ion-flag', prefix: 'ion', markerColor: 'gray', extraClasses: 'map-obs-marker map-obs-marker-set' }),
            center = [62.5, 10]; //default map center when no observation or user location


        /**
         * Map selected item, this could be observations, nearby places or location marker
         */
        service._selectedItem = null;

        /**
         * Set selected item
         * @param {} header 
         * @param {} description 
         * @returns {} 
         */
        service._setSelectedItem = function (item) {
            service._selectedItem = item;
            if (item && item.setViewOnSelect) {
                var pos = item.getPosition();
                if (pos) {
                    service._disableFollowMode();
                    map.panTo(pos); //pan map to selected item
                }
            }

            $rootScope.$broadcast('$regObs:mapItemSelected', item);
        };

        /**
         * Update info text with distance from user to observation
         * @param {} latlng 
         * @returns {} 
         */
        service._updateObsInfoText = function (latlng) {
            if (!observationInfo) return;

            if (!latlng && ObsLocation.isSet()) {
                var obsLoc = ObsLocation.get();
                latlng = new L.LatLng(obsLoc.Latitude, obsLoc.Longitude);
            }

            var text = '';
            if (latlng && userMarker) {
                var distance = userMarker.getLatLng().distanceTo(latlng).toFixed(0);
                text = Utility.getDistanceText(distance);
            } else if (userMarker && !latlng) {
                text = '0m';
            } else if (!ObsLocation.isSet()) {
                text = $translate.instant('NOT_SET');
            }

            observationInfo.setText(text);
        };

        service._getObservationPinHtml = function (selected) {
            var geoHazardType = AppSettings.getAppMode();
            return '<div class="observation-pin ' + (selected ? 'selected ' : '') + geoHazardType + '"><i class="icon ion-flag observation-pin-icon"></div>';
        };

        service._getObservationPinIcon = function (selected) {
            return L.divIcon({
                className: 'my-div',
                html: service._getObservationPinHtml(selected)
            });
        };

        /**
         * Unselect all observation pin markers
         * @returns {} 
         */
        service._unselectAllObservationIcons = function () {
            layerGroups.observations.getLayers()
                .forEach(function (item) {
                    if (item instanceof L.Marker) {
                        item.setIcon(service._getObservationPinIcon(false));
                    }
                });
        };

        /**
         * Unselect all markers
         * @returns {} 
         */
        service._unselectAllMarkers = function () {
            service._unselectAllObservationIcons();
            service._unselectAllLocationIcons();
        };

        var drawObservations = function () {
            layerGroups.observations.clearLayers();
            Observations.getStoredObservations(Utility.getCurrentGeoHazardTid()).then(function (result) {
                result.forEach(function (obs) {
                    var latlng = new L.LatLng(obs.Latitude, obs.Longitude);
                    var m = L.marker(latlng, { icon: service._getObservationPinIcon() });
                    m.on('click',
                        function () {
                            service._unselectAllMarkers(); //unselect all other markers
                            m.setIcon(service._getObservationPinIcon(true));
                            
                            var obsObject = RegObs.observationFromJson(obs, AppSettings);
                            obsObject.setPosition(latlng);
                            if (userMarker) {
                                var distance = service.getUserDistanceFrom(obs.Latitude, obs.Longitude);
                                obsObject.setDistance(distance);
                            }
                            service._setSelectedItem(obsObject);
                        });
                    m.addTo(layerGroups.observations);
                });
            });
        };

        var hideObservations = function () {
            layerGroups.observations.clearLayers();
        };

        service._getStoredLocationIcon = function (selected) {
            var geoHazardType = AppSettings.getAppMode();
            return L.divIcon({ className: 'nearby-location-marker', html: '<div class="nearby-location-marker ' + (selected ? 'selected ' : '') + geoHazardType + '"><div class="nearby-location-marker-inner"></div></div>' });
        };

        service._unselectAllLocationIcons = function () {
            layerGroups.locations.getLayers()
                .forEach(function (item) {
                    if (item instanceof L.Marker) {
                        item.setIcon(service._getStoredLocationIcon(false));
                    }
                });
        };

        var drawStoredLocations = function () {
            layerGroups.locations.clearLayers();

            var geoHazardTid = Utility.getCurrentGeoHazardTid();
            var storedLocations = Observations.getLocations(geoHazardTid);
            storedLocations.forEach(function (loc) {
                var latlng = new L.LatLng(loc.LatLngObject.Latitude, loc.LatLngObject.Longitude);
                var m = L.marker(latlng, { icon: service._getStoredLocationIcon() });
                m.on('click', function () {
                    
                    service._unselectAllMarkers();
                    m.setIcon(service._getStoredLocationIcon(true));

                    var item = new RegObs.MapSelectableItem();
                    if (userMarker) {
                        var distance = service.getUserDistanceFrom(loc.LatLngObject.Latitude, loc.LatLngObject.Longitude);
                        item.setDistance(distance);
                    }
                    item.setPosition(latlng);
                    item.setHeader(loc.Name);
                    item.setType($translate.instant('STORED_LOCATION'));

                    service._setSelectedItem(item);
                });
                m.addTo(layerGroups.locations);
            });
        };

        var hideLocations = function () {
            layerGroups.locations.clearLayers();
        };

        service.clearObsLocation = function () {
            ObsLocation.remove();
            if (userMarker) {
                drawObsLocation();
                updateDistanceLine(false);
            }
            if (obsLocationMarker) {
                obsLocationMarker.setIcon(icon);
            }
            service._updateObsInfoText();
            service.clearSelectedMarkers();
        }

        service._isObsLocSetManually = function () {
            var obsLoc = ObsLocation.get();
            return obsLoc.UTMSourceTID === ObsLocation.source.clickedInMap;
        };

        service._setLocationSelected = function () {
            service._unselectAllMarkers();
            var item = new RegObs.MapSelectableItem();
            item.setViewOnSelect = false;
            if (service._isObsLocSetManually()) {
                if (obsLocationMarker) {
                    var latlng = obsLocationMarker.getLatLng();
                    if (userMarker) {
                        var distance = service.getUserDistanceFrom(latlng.lat, latlng.lng);
                        item.setDistance(distance);
                    }
                    item.setDescription($translate.instant('MARKED_POSITION'));
                    item.setPosition(latlng);
                    item.showDeletePosition = true;
                    service._setSelectedItem(item);
                }
            } else {
                item.setHeader($translate.instant('YOUR_GPS_POSITION'));
                item.setDescription($translate.instant('SET_POSITION_HELP_TEXT'));
            }
            service._setSelectedItem(item);
        };

        var setObsLocation = function (latlng) {
            if (obsLocationMarker && latlng) {
                obsLocationMarker.setLatLng(latlng);

                if (obsLocationMarker.options.icon !== iconSet) {
                    obsLocationMarker.setIcon(iconSet);
                }
                var obsLoc = {
                    Latitude: latlng.lat.toString(),
                    Longitude: latlng.lng.toString(),
                    Uncertainty: '0',
                    UTMSourceTID: ObsLocation.source.clickedInMap
                };
                ObsLocation.set(obsLoc);
                updateDistanceLine(true);
                service._updateObsInfoText();
                service._setLocationSelected();
            }
        };

        var drawObsLocation = function () {
            var latlng;
            if (ObsLocation.isSet()) {
                latlng = L.latLng(ObsLocation.get().Latitude, ObsLocation.get().Longitude);
            } else if (userMarker) {
                latlng = userMarker.getLatLng();
            } else {
                latlng = center;
            }

            if (latlng) {
                if (!obsLocationMarker) {
                    obsLocationMarker = new L.Marker(latlng, { icon: icon, draggable: 'true', zIndexOffset: 1000 });
                    obsLocationMarker.on('dragstart', function (event) {
                        isDragging = true;
                    });

                    obsLocationMarker.on('click', function (event) {
                        service._setLocationSelected();
                    });

                    obsLocationMarker.on('drag', function (event) {
                        var marker = event.target;
                        if (marker) {
                            var position = marker.getLatLng();
                            if (position) {
                                updateDistanceLineLatLng(position, true);
                                service._updateObsInfoText(position);
                            }
                        }
                    });
                    obsLocationMarker.on('dragend', function (event) {
                        isDragging = false;
                        var marker = event.target;
                        if (marker) {
                            setObsLocation(marker.getLatLng());
                        }
                    });
                    obsLocationMarker.addTo(layerGroups.user);
                } else {
                    obsLocationMarker.setLatLng(latlng);
                }

                if (ObsLocation.isSet()) {
                    if (obsLocationMarker.options.icon !== iconSet) {
                        obsLocationMarker.setIcon(iconSet);
                    }
                    updateDistanceLine(true);
                    service._updateObsInfoText();
                }
            }
        }



        var updateDistanceLineLatLng = function (latlng) {
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

        var updateDistanceLine = function () {
            if (ObsLocation.isSet() && userMarker) {
                var obsLoc = ObsLocation.get();
                var latlng = new L.LatLng(obsLoc.Latitude, obsLoc.Longitude);
                updateDistanceLineLatLng(latlng);
            } else {
                if (pathLine) {
                    layerGroups.user.removeLayer(pathLine);
                    pathLine = null;
                }
            }
        }

        var drawUserLocation = function (obsLoc) {
            if (obsLoc.Latitude && obsLoc.Longitude) {
                var latlng = new L.LatLng(obsLoc.Latitude, obsLoc.Longitude);

                var accuracy = obsLoc.Uncertainty || 1;

                if (!userMarker) {
                    userMarker = L.userMarker(latlng, { pulsing: true, accuracy: accuracy, smallIcon: true, zIndexOffset: 1000 });
                    userMarker.addTo(layerGroups.user);
                } else {
                    userMarker.setLatLng(latlng);
                    userMarker.setAccuracy(accuracy);
                }

                if (!isDragging) {
                    drawObsLocation();
                    service._updateObsInfoText();
                }

                if (followMode) {
                    map.panTo(latlng);
                }
            }
        }

        var hideAllTiles = function () {
            for (var i = 1; i < tiles.length; i++) {
                layerGroups.tiles.removeLayer(tiles[i]);
            }
        };

        var getTileIndex = function (name) {
            for (var i = 0; i < AppSettings.tiles.length; i++) {
                if (AppSettings.tiles[i].name === name) {
                    return i;
                }
            }
            return -1;
        };

        var getTileByName = function (name) {
            var index = getTileIndex(name);
            return tiles[index];
        };

        service.getTileByName = getTileByName;

        var showTile = function (name, opacity) {
            if (layerGroups.tiles) {
                var t = getTileByName(name);
                if (t) {
                    if (opacity) {
                        t.setOpacity(opacity);
                    }
                    layerGroups.tiles.addLayer(t);
                }
            }
        };

        service._disableFollowMode = function () {
            followMode = false;
        };

        service.createMap = function (elem) {
            var firstLoad = true;

            if (ObsLocation.isSet()) {
                var currentPosition = ObsLocation.get();
                center = [currentPosition.Latitude, currentPosition.Longitude];
            }

            map = L.map(elem, {
                center: center,
                zoom: 5,
                maxZoom: AppSettings.maxMapZoomLevel,
                zoomControl: false,
                attributionControl: false
            });

            layerGroups = { //Layers are added in order
                tiles: L.layerGroup().addTo(map),
                locations: L.markerClusterGroup({
                    showCoverageOnHover: false,
                    iconCreateFunction: function (cluster) {
                        var innerDiv = '<div class="nearby-location-marker-inner nearby-location-marker-inner-cluster">' + cluster.getChildCount() + '</div>';
                        return L.divIcon({ html: innerDiv, className: 'nearby-location-marker obs-marker-cluster snow', iconSize: L.point(30, 30) });
                    }
                }).addTo(map),
                observations: L.markerClusterGroup({
                    showCoverageOnHover: false,
                    iconCreateFunction: function (cluster) {
                        var innerDiv = '<div class="observation-pin obs-marker-cluster snow"><div class="observation-pin-icon">' + cluster.getChildCount() + '</div></div>';
                        return L.divIcon({ html: innerDiv, className: 'observation-pin-cluster', iconSize: L.point(30, 30) });
                    }
                }).addTo(map),
                user: L.layerGroup().addTo(map)
            };

            tiles = [];

            AppSettings.tiles.forEach(function (tile) {
                var t = L.tileLayerRegObs(tile.url, { folder: AppSettings.mapFolder, name: tile.name, debugFunc: AppLogging.log });
                tiles.push(t);
            });
            tiles[0].addTo(layerGroups.tiles);

            map.on('locationfound',
               function (position) {
                   drawUserLocation({
                       Latitude: position.latitude,
                       Longitude: position.longitude,
                       Uncertainty: position.accuracy
                   });
                   if (!ObsLocation.isSet() && firstLoad) {
                       service.setView(L.latLng(position.latitude, position.longitude));
                   }
                   firstLoad = false;
               });

            map.on('locationerror',
                function (e) {
                    AppLogging.log('GPS error: ' + e.message);
                });

            map.on('contextmenu', function (e) {
                setObsLocation(e.latlng);
            });

            map.on('click', function (e) {
                //TODO: hide menus
                AppLogging.log('Click in map - hide floating menu');
                service.clearSelectedMarkers();
            });

            map.on('dragstart', service._disableFollowMode);
            map.on('zoomstart', function () {
                if (!isProgramaticZoom) {
                    service._disableFollowMode();
                }
            });

            observationInfo = L.obsLocationInfo().addTo(map);
            service.updateMapFromSettings();

            drawObsLocation();
            if (ObsLocation.isSet()) {
                service.setView(L.latLng(ObsLocation.get().Latitude, ObsLocation.get().Longitude));
            }

            return map;
        };

        service.clearSelectedMarkers = function () {
            service._unselectAllMarkers();
            service._setSelectedItem(null);
        };

        service.setView = function (latlng, zoom) {
            isProgramaticZoom = true;
            map.setView(latlng, zoom || 9);
            isProgramaticZoom = false;
        };

        service.getCenter = function () {
            return map.getCenter();
        };

        service.getZoom = function () {
            return map.getZoom();
        };

        service.getTiles = function () {
            return tiles;
        };

        service.getUserDistanceFrom = function (lat, lng) {
            if (userMarker) {
                var latlng = new L.LatLng(lat, lng);
                var distance = userMarker.getLatLng().distanceTo(latlng).toFixed(0);
                var description = Utility.getDistanceText(distance);
                return { distance: distance, description: description };
            }
            return { distance: null, description: 'Ikke kjent' };
        };

        service.centerMapToUser = function () {
            followMode = true;
            if (userMarker) {
                AppLogging.log('Center map to user marker');
                if (map) {
                    map.panTo(userMarker.getLatLng());
                }
            }
        };

        service.changeAppMode = function () {
            service.updateMapFromSettings();
        };

        service.updateObservationsInMap = function () {
            if (map) {
                var center = map.getCenter();
                var bounds = map.getBounds();
                var radius = parseInt((bounds.getNorthWest().distanceTo(bounds.getSouthEast()) / 2).toFixed(0));
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
                .finally(service.updateMapFromSettings);
            }
        };

        //TODO: Move/Rename this to map.refresh() or something
        service.updateMapFromSettings = function () {
            hideAllTiles();
            var geoId = Utility.getCurrentGeoHazardTid();
            AppSettings.data.maps.forEach(function (mapSetting) {
                if (mapSetting.geoHazardTid === geoId) {
                    if (mapSetting.tiles) {
                        mapSetting.tiles.forEach(function (tileSetting) {
                            if (tileSetting.visible) {
                                showTile(tileSetting.name, tileSetting.opacity);
                            }
                        });
                    }
                }
            });
            if (AppSettings.data.showPreviouslyUsedPlaces) {
                drawStoredLocations();
            } else {
                hideLocations();
            }
            if (AppSettings.data.showObservations) {
                drawObservations();
            } else {
                hideObservations();
            }

            drawObsLocation();
            service._updateObsInfoText();
            service.invalidateSize();
        };

        service.startWatch = function () {
            if (map) {
                AppLogging.log('Start watching gps location');
                document.addEventListener("deviceready",
                    function () {
                        map.locate({ watch: true, enableHighAccuracy: true });
                    },
                    false);
            }
        };

        service.clearWatch = function () {
            if (map) {
                AppLogging.log('Stop watching gps location');
                map.stopLocate();
            }
        };

        service.invalidateSize = function () {
            if (map) {
                map.invalidateSize();
            }
        };

        service.calculateXYZListFromBounds = function (bounds, zoomMin, zoomMax) {
            if (!tiles) return [];
            return tiles[0].calculateXYZListFromBounds(bounds, zoomMin, zoomMax);
        };

        service.calculateXYZSizeFromBounds = function (bounds, zoomMin, zoomMax) {
            if (!map || !tiles) return 0;
            return tiles[0].calculateXYZSizeFromBounds(bounds, zoomMin, zoomMax);
        };


        return service;
    });