angular
    .module('RegObs')
    .factory('Map', function (AppSettings, AppLogging, ObsLocation, Observations, Utility, $state, Registration, $ionicPlatform, $rootScope, $q, $timeout, $ionicPopup, $interval, RegobsPopup) {
        var service = this;
        var map, //Leaflet map
            layerGroups, //Layer groups object
            obsLocationMarker, //Leaflet marker for current obs location
            userMarker, //Leaflet marker for user position
            pathLine, //Leaflet (dotted) path between user position and current obs location
            markerMenu, //Obs location marker menu
            closeMarkerMenuTimer, //Timer for automatically closing marker menu
            observationInfo, //Obs location information. Displayed on top right corner
            isDragging = false, //is user currently dragging map?
            tiles = [], //Map tiles
            isProgramaticZoom = false, //Is currently programatic zoom
            followMode = true, //Follow user position, or has user manually dragged or zoomed map?
            icon = L.AwesomeMarkers.icon({ icon: 'arrow-move', prefix: 'ion', markerColor: 'green', extraClasses: 'map-obs-marker' }),
            iconSet = L.AwesomeMarkers.icon({ icon: 'ion-flag', prefix: 'ion', markerColor: 'gray', extraClasses: 'map-obs-marker map-obs-marker-set' }),
            center = [62.5, 10]; //default map center when no observation or user location

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
                text = 'Ikke satt';
            }

            observationInfo.setText(text);
        };

        //var getObsIcon = function (obs) {
        //    //var color = Utility.geoHazardColor(obs.GeoHazardTid);
        //    var color = 'white';
        //    var iconColor = '#444';
        //    if (obs.GeoHazardTid === 20) {
        //        color = 'beige';
        //        iconColor = '#FFF';
        //    } else if (obs.GeoHazardTid === 60) {
        //        color = 'blue';
        //        iconColor = '#FFF';
        //    } else if (obs.GeoHazardTid === 70) {
        //        color = 'cadetblue';
        //        iconColor = '#FFF';
        //    }
        //    return L.AwesomeMarkers.icon({
        //        icon: 'ion-flag',
        //        prefix: 'ion',
        //        markerColor: color,
        //        iconColor: iconColor,
        //        extraClasses: 'map-obs-marker-observation'
        //    });
        //}

        var drawObservations = function () {
            layerGroups.observations.clearLayers();
            Observations.getStoredObservations(Utility.getCurrentGeoHazardTid()).forEach(function (obs) {
                var latlng = new L.LatLng(obs.LatLngObject.Latitude, obs.LatLngObject.Longitude);
                var geoHazardType = Utility.getGeoHazardType(obs.GeoHazardTid);
                var myIcon = L.divIcon({ className: 'my-div', html: '<div class="observation-pin ' + geoHazardType + '"><i class="icon ion-flag observation-pin-icon"></div>' });
                var m = L.marker(latlng, { icon: myIcon });
                //var m = new L.Marker(latlng, { icon: getObsIcon(obs) });
                m.on('click',
                    function () {
                        $state.go('observationdetails', { observation: obs });
                    });
                m.addTo(layerGroups.observations);
            });

        };

        var hideObservations = function () {
            layerGroups.observations.clearLayers();
        };

        //var updateNearbyLocations = function (lat, lng, distance, geoHazardTid) {
        //    return $q(function (resolve, reject) {
        //        Observations.getNearbyLocations(lat, lng, distance, geoHazardTid)
        //            .then(function () {
        //                drawStoredLocations();
        //                resolve();
        //            }).catch(reject);
        //    });
        //};

        var drawStoredLocations = function () {
            layerGroups.locations.clearLayers();

            var geoHazardTid = Utility.getCurrentGeoHazardTid();
            var storedLocations = Observations.getLocations(geoHazardTid);
            storedLocations.forEach(function (loc) {
                var latlng = new L.LatLng(loc.LatLngObject.Latitude, loc.LatLngObject.Longitude);
                var geoHazardType = Utility.getGeoHazardType(loc.geoHazardId);
                var myIcon = L.divIcon({ className: 'my-div-icon', html: '<div class="nearby-location-marker ' + geoHazardType + '"><div class="nearby-location-marker-inner"></div></div>' });
                var m = L.marker(latlng, { icon: myIcon });
                m.on('click', function () { $state.go('locationdetails', { location: loc }) });
                m.addTo(layerGroups.locations);
            });
        };

        var hideLocations = function () {
            layerGroups.locations.clearLayers();
        };

        var startTrip = function () {
            if (AppSettings.getAppMode() === 'snow') {
                $state.go('snowtrip');
            }
        };

        var removeMarkerMenu = function () {
            if (obsLocationMarker) {
                obsLocationMarker.removeMenu();
            }
        };

        var clearObsLocation = function () {
            ObsLocation.remove();
            if (userMarker) {
                drawObsLocation();
                updateDistanceLine(false);
            }
            removeMarkerMenu();
            if (obsLocationMarker) {
                obsLocationMarker.setIcon(icon);
            }

            //observationInfo.update();
            service._updateObsInfoText();
        }

        var getMarkerMenuItems = function () {
            var mode = AppSettings.getAppMode();
            var items = [];
            items.push({
                title: Utility.getNewObservationText(),
                click: function () { // callback function fired on click. this points to item
                    Registration.createAndGoToNewRegistration();
                },
                menuIcon: "ion-plus"
            });
            if (mode === 'snow') {
                items.push({
                    title: 'Meld fra om tur',
                    click: function () {
                        startTrip();
                    },
                    menuIcon: "ion-android-walk"
                });
            }
            items.push({
                title: 'Fjern markering',
                className: "red-circle",
                click: function () {
                    clearObsLocation();
                },
                menuIcon: "ion-close"
            });

            return items;
        };

        var createMarkerMenu = function () {
            if (obsLocationMarker) {
                if (!markerMenu) {
                    markerMenu = L.markerMenu({
                        radius: 55, // radius of the circle,
                        size: [38, 38], // menu items width and height
                        offset: [0, 20],
                        items: getMarkerMenuItems()
                    });
                }
                if (obsLocationMarker.getMenu() !== markerMenu) {
                    AppLogging.log('setting new marker menu');
                    obsLocationMarker.setMenu(markerMenu);
                }
            }
        };

        var setObsLocation = function (latlng) {
            if (obsLocationMarker && latlng) {

                if (closeMarkerMenuTimer) {
                    $timeout.cancel(closeMarkerMenuTimer);
                }

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
                createMarkerMenu();
                obsLocationMarker.openMenu();
                closeMarkerMenuTimer = $timeout(function () {
                    obsLocationMarker.closeMenu();
                }, 3000);
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
                    obsLocationMarker.unbindPopup();
                    createMarkerMenu();
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

        var disableFollowMode = function () {
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
                    iconCreateFunction: function (cluster) {
                        var innerDiv = '<div class="nearby-location-marker-inner nearby-location-marker-inner-cluster">' + cluster.getChildCount() + '</div>';
                        return L.divIcon({ html: innerDiv, className: 'nearby-location-marker obs-marker-cluster snow', iconSize: L.point(30, 30) });
                    }
                }).addTo(map),
                observations: L.markerClusterGroup({
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
            });

            map.on('dragstart', disableFollowMode);
            map.on('zoomstart', function () {
                if (!isProgramaticZoom) {
                    disableFollowMode();
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
            removeMarkerMenu();
            markerMenu = null;
            createMarkerMenu();
            service.updateMapFromSettings();
        };

        service.updateObservationsInMap = function () {
            if (map) {
                var center = map.getCenter();
                var bounds = map.getBounds();
                var distance = bounds.getNorthWest().distanceTo(bounds.getSouthEast()).toFixed(0);
                var geoHazardTid = Utility.getCurrentGeoHazardTid();

                var workFunc = function (onProgress, cancel) {
                    return Observations
                        .updateObservationsWithinRadius(center.lat,
                            center.lng,
                            distance,
                            geoHazardTid,
                            new RegObs.ProggressStatus(),
                            onProgress,
                            cancel);
                };

                RegobsPopup.downloadProgress('Oppdaterer kartet med det siste fra regObs', workFunc, { longTimoutMessageDelay: 10, closeOnComplete: true })
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
        }

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