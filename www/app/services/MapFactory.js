angular
    .module('RegObs')
    .factory('Map', function (AppSettings, AppLogging, ObsLocation, Observations, Utility, $state, Registration, $ionicPlatform, $rootScope, $q) {
        var service = this;
        var map, obsLocationMarker, observationsLayerGroup, markersLayerGroup, tilesLayerGroup, userMarker, pathLine, popup, popupInfoObservation, markerMenu, firstLoad = true, isDragging = false, tiles = [];
        var icon = L.AwesomeMarkers.icon({ icon: 'arrow-move', prefix: 'ion', markerColor: 'green', extraClasses: 'map-obs-marker' });
        var iconSet = L.AwesomeMarkers.icon({ icon: 'ion-flag', prefix: 'ion', markerColor: 'gray', extraClasses: 'map-obs-marker map-obs-marker-set' });
        var center = [
                62.5,
                10
        ];

        var drawObservations = function () {
            if (observationsLayerGroup) {
                observationsLayerGroup.clearLayers();
                Observations.observations.forEach(function (obs) {
                    var obsIcon = L.AwesomeMarkers.icon({
                        icon: 'ion-flag',
                        prefix: 'ion',
                        markerColor: 'white',
                        iconColor: '#444',
                        extraClasses: 'map-obs-marker-observation'
                    });
                    var latlng = new L.LatLng(obs.LatLngObject.Latitude, obs.LatLngObject.Longitude);
                    var m = new L.Marker(latlng, { icon: obsIcon });
                    m.addTo(observationsLayerGroup);
                });
            }
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
                drawObsLocation(userMarker.getLatLng(), false);
                updateDistanceLine(false);
            }
            removeMarkerMenu();
            if (obsLocationMarker) {
                obsLocationMarker.setIcon(icon);
            }
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
                        size: [34, 34], // menu items width and height
                        items: getMarkerMenuItems()
                    });
                }
                if (obsLocationMarker.getMenu() !== markerMenu) {
                    AppLogging.log('setting new marker menu');
                    obsLocationMarker.setMenu(markerMenu);
                }
            }
        };

        var drawObsLocation = function (zoom) {
            AppLogging.log('DRAW Current Obs position');
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
                    obsLocationMarker = new L.Marker(latlng, { icon: icon, draggable: 'true' });
                    obsLocationMarker.on('dragstart', function (event) {
                        isDragging = true;
                    });

                    obsLocationMarker.on('drag', function (event) {
                        var marker = event.target;
                        if (marker) {
                            var position = marker.getLatLng();
                            if (position) {
                                updateDistanceLineLatLng(position, true);
                                openAndUpdatePopup(position);
                            }
                        }
                    });
                    obsLocationMarker.on('dragend', function (event) {
                        isDragging = false;
                        closePopup();
                        var marker = event.target;
                        if (marker) {
                            if (marker.options.icon !== iconSet) {
                                marker.setIcon(iconSet);
                            }
                            var position = marker.getLatLng();
                            if (position) {
                                var obsLoc = {
                                    Latitude: position.lat.toString(),
                                    Longitude: position.lng.toString(),
                                    Uncertainty: '0',
                                    UTMSourceTID: ObsLocation.source.clickedInMap
                                }
                                ObsLocation.set(obsLoc);
                            }
                        }
                        updateDistanceLine(true);
                        createMarkerMenu();
                    });
                    obsLocationMarker.addTo(markersLayerGroup);
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
                } else {
                    if (!popupInfoObservation) {
                        popupInfoObservation = L.popup()
                            .setContent('Du kan sette posisjon manuelt ved å dra markør, hvis ikke blir observert lokasjon satt til din gjeldende gps posisjon.');
                        obsLocationMarker.on('popupclose', obsLocationMarker.unbindPopup);//remove info popup when closed
                        obsLocationMarker.bindPopup(popupInfoObservation).openPopup();
                    }
                    if (obsLocationMarker.options.icon !== icon) {
                        obsLocationMarker.setIcon(icon);                      
                    }
                }

                if (zoom) {
                    map.setView(latlng, 9);
                }
            }
        }

        var getDistanceText = function (distance) {
            var dText;
            if (distance > 1000) {
                dText = (distance / 1000).toFixed(1) + ' km';
            } else {
                dText = (distance || 0) + ' m';
            }
            return dText + ' til observasjonspunkt';
        };

        var updateDistanceLineLatLng = function (latlng) {
            if (userMarker && latlng) {
                var path = [latlng, userMarker.getLatLng()];
                if (!pathLine) {
                    pathLine = L.polyline(path, { color: 'black', weight: 6, opacity: .5, dashArray: "10,10" })
                        .addTo(markersLayerGroup);
                } else {
                    pathLine.setLatLngs(path);
                }
            }
        };

        var closePopup = function () {
            if (popup && map) {
                map.closePopup(popup);
            }
        }

        var openAndUpdatePopup = function (latlng) {
            if (userMarker && latlng) {
                var distance = userMarker.getLatLng().distanceTo(obsLocationMarker.getLatLng()).toFixed(0);
                var center = pathLine.getBounds().getCenter();
                if (!popup) {
                    popup = L.popup().setLatLng(center).setContent(getDistanceText(distance));
                } else {
                    popup.setLatLng(center).setContent(getDistanceText(distance));
                }
                popup.openOn(map);
            }
        };

        var updateDistanceLine = function () {
            if (ObsLocation.isSet() && userMarker) {
                var obsLoc = ObsLocation.get();
                var latlng = new L.LatLng(obsLoc.Latitude, obsLoc.Longitude);
                updateDistanceLineLatLng(latlng);
            } else {
                if (pathLine) {
                    markersLayerGroup.removeLayer(pathLine);
                    pathLine = null;
                }
            }
        }

        var drawUserLocation = function (obsLoc, zoom) {
            AppLogging.log('DRAW user position');
            if (obsLoc.Latitude && obsLoc.Longitude) {
                var latlng = new L.LatLng(obsLoc.Latitude, obsLoc.Longitude);

                var accuracy = obsLoc.Uncertainty || 1;

                if (!userMarker) {
                    userMarker = L.userMarker(latlng, { pulsing: true, accuracy: accuracy, smallIcon: true });
                    userMarker.addTo(markersLayerGroup);
                } else {
                    userMarker.setLatLng(latlng);
                }

                if (!isDragging) {
                    drawObsLocation(false);
                }

                if (zoom) {
                    map.setView(latlng, 9);
                }
            }
        }

        var hideAllTiles = function () {
            for (var i = 1; i < tiles.length; i++) {
                tilesLayerGroup.removeLayer(tiles[i]);
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
            if (tilesLayerGroup) {
                var t = getTileByName(name);
                if (t) {
                    if (opacity) {
                        t.setOpacity(opacity);
                    }
                    tilesLayerGroup.addLayer(t);
                }
            }
        };

        service.createMap = function (elem) {
            firstLoad = true;

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

            tilesLayerGroup = L.layerGroup().addTo(map);
            observationsLayerGroup = L.layerGroup().addTo(map);
            markersLayerGroup = L.layerGroup().addTo(map);

            tiles = [];

            //$ionicPlatform.ready(function () {
                AppSettings.tiles.forEach(function (tile) {
                    var t = L.tileLayerRegObs(tile.url, { folder: 'map-' + tile.name, name: tile.name, debugFunc: AppLogging.log });
                    tiles.push(t);
                });
                tiles[0].addTo(tilesLayerGroup);
            //}, false);

            map.on('locationfound',
               function (position) {
                   drawUserLocation({
                       Latitude: position.latitude,
                       Longitude: position.longitude,
                       Uncertainty: position.accuracy
                   }, !ObsLocation.isSet() && firstLoad);
                   firstLoad = false;
               });

            map.on('locationerror',
                function (e) {
                    AppLogging.log('GPS error: ' + e.message);
                });

            service.updateMapFromSettings();

            if (ObsLocation.isSet()) {
                drawObsLocation(true);
            } else {
                drawObsLocation(false);
            }

            drawObservations();

            map.invalidateSize();

            return map;
        };

        service.getTiles = function () {
            return tiles;
        };

        service.centerMapToUser = function () {
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
                Observations.updateObservationsWithinRadius(center.lat, center.lng, distance, geoHazardTid)
                    .then(drawObservations);
            }
        };

        service.updateMapFromSettings = function () {
            //var appMode = AppSettings.getAppMode();
            hideAllTiles();
            var geoId = Utility.getCurrentGeoHazardTid();
            AppSettings.data.maps.forEach(function(mapSetting) {
                if (mapSetting.geoHazardTid === geoId) {
                    if (mapSetting.tiles) {
                        mapSetting.tiles.forEach(function(tileSetting) {
                            if (tileSetting.visible) {
                                showTile(tileSetting.name, tileSetting.opacity);
                            }
                        });
                    }
                }
            });
            //if (appMode === 'snow') {
            //    if (AppSettings.data.showSteepnessMap) {
            //        showTile('steepness', AppSettings.data.steepnessMapOpacity);
            //    }
            //}else if (appMode === 'ice') {
            //    if (AppSettings.data.showIceMap) {
            //        showTile('ice', AppSettings.data.steepnessMapOpacity);
            //    }
            //}
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

        service.calculateXYZList = function (zoomMin, zoomMax) {
            if (!map || !tiles) return [];
            var bounds = map.getBounds();
            AppLogging.log('Calculation xyz list from bounds: ' + JSON.stringify(bounds) + 'zmin: ' + zoomMin + ' zmax:' + zoomMax);
            return tiles[0].calculateXYZListFromBounds(bounds, zoomMin, zoomMax);
        };

        service.calculateXYZSize = function (zoomMin, zoomMax) {
            if (!map || !tiles) return 0;
            return tiles[0].calculateXYZSizeFromBounds(map.getBounds(), zoomMin, zoomMax);
        };

        service.downloadMap = function (zoomMin, zoomMax, mapsArray, progressCallback, completeCallback, cancelCallback) {
            if (!zoomMin)
                throw Error('zoomMin must be set');
            if (!zoomMax)
                throw Error('zoomMax must be set');
            if (!mapsArray || mapsArray.length <= 0)
                throw Error('Maps array must be an array of map names');

            var mapStatus = [];
            var xyzList = service.calculateXYZList(zoomMin, zoomMax);
            AppLogging.log('Download map for xyz list: ' + JSON.stringify(xyzList));
            var checkProgress = function () {
                var hasAnyRunning = false;
                var hasAnyError = false;
                var total = xyzList.length * mapsArray.length;
                var done = 0;
                mapStatus.forEach(function (item) {
                    done += item.done;
                    if (done === total) {
                        item.complete = true;
                    }

                    if (!item.complete) {
                        hasAnyRunning = true;
                    }
                    if (item.error > 0) {
                        hasAnyError = true;
                    }
                });
                var percent = Math.round(100 * done / total);
                if ((hasAnyRunning && progressCallback) || mapStatus.length < mapsArray.length) {
                    progressCallback({ complete: false, total: total, done: done, percent: percent, status: mapStatus, hasError: hasAnyError });
                } else if (completeCallback) {
                    completeCallback({ complete: true, total: total, done: done, percent: percent, status: mapStatus, hasError: hasAnyError });
                }
            };
            mapsArray.forEach(function (item) {
                var tile = getTileByName(item);
                var description = AppSettings.getTileByName(item).description;
                var status = { name: item, description: description, total: xyzList.length, done: 0, percent: 0, complete: false, error: 0 };
                mapStatus.push(status);
                tile.downloadXYZList(xyzList,
                    false,
                    function (done, total) {
                        status.done = done;
                        status.total = total;
                        status.percent = Math.round(100 * done / total);
                        checkProgress();
                    },
                    function () {
                        status.complete = true;
                        status.done = status.total;
                        status.percent = 100;
                        checkProgress();
                    },
                    function (error) {
                        status.error++;
                        checkProgress();
                    }, cancelCallback);
            });
        }

        service.emptyCache = function () {
            return $q(function (resolve) {
                var index = 0;
                var callbacks = [];
                var checkCallback = function () {
                    if (callbacks.length === tiles.length) {
                        resolve(callbacks);
                    }
                };

                if (!tiles) {
                    resolve(callbacks);
                }

                tiles.forEach(function (t) {
                    var name = AppSettings.tiles[index].name;
                    t.emptyCache(function (oks, fails) {
                        AppLogging.log("Cleared cache for map " +
                            name +
                            ".\n" +
                            oks +
                            " deleted OK\n" +
                            fails +
                            " failed");
                        callbacks.push({ name: name, ok: oks, failed: fails });
                        checkCallback();
                    });
                    index++;
                });
            });
        };

        //var onOffline = function () {
        //    AppLogging.log("Going offline");
        //    tiles.forEach(function (t) {
        //        t.goOffline();
        //    });
        //};

        //var onOnline = function () {
        //    AppLogging.log("Going online");
        //    tiles.forEach(function (t) {
        //        t.goOnline();
        //    });
        //};

        //$rootScope.$on('$cordovaNetwork:online', onOnline);

        //$rootScope.$on('$cordovaNetwork:offline', onOffline);

        return service;
    });