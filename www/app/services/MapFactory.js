angular
    .module('RegObs')
    .factory('Map', function (AppSettings, AppLogging, ObsLocation, Observations, Utility, $state, Registration, $ionicPlatform, $rootScope, $q, $timeout, $ionicPopup, $interval, RegobsPopup) {
        var service = this;
        var map,
            obsLocationMarker,
            observationsLayerGroup,
            markersLayerGroup,
            tilesLayerGroup,
            locationLayerGroup,
            userMarker,
            pathLine,
            popup,
            markerMenu,
            closeMarkerMenuTimer,
            observationInfo,
            firstLoad = true,
            isDragging = false,
            tiles = [],
            isProgramaticZoom = false,
            followMode = true;
        var icon = L.AwesomeMarkers.icon({ icon: 'arrow-move', prefix: 'ion', markerColor: 'green', extraClasses: 'map-obs-marker' });
        var iconSet = L.AwesomeMarkers.icon({ icon: 'ion-flag', prefix: 'ion', markerColor: 'gray', extraClasses: 'map-obs-marker map-obs-marker-set' });
        var center = [
                62.5,
                10
        ];

        var createObservationInfo = function () {
            observationInfo = L.control();

            observationInfo.onAdd = function () {
                this._div = L.DomUtil.create('div', 'map-observation-info'); // create a div with a class "info"
                this.update();
                return this._div;
            };

            var flag = '<i class="icon ion-flag"></i> ';

            observationInfo.updateFromLatLng = function (latlng) {
                if (latlng && userMarker) {
                    var distance = userMarker.getLatLng().distanceTo(latlng).toFixed(0);
                    this._div.innerHTML = flag + getDistanceText(distance);
                }
            };

            observationInfo.update = function () {
                if (ObsLocation.isSet() && userMarker) {
                    var obsLoc = ObsLocation.get();
                    var latlng = new L.LatLng(obsLoc.Latitude, obsLoc.Longitude);
                    this.updateFromLatLng(latlng);
                } else if (userMarker) {
                    this._div.innerHTML = flag + '0m';
                } else if (ObsLocation.isSet()) {
                    this._div.innerHTML = flag;
                } else {
                    this._div.innerHTML = flag + 'Ikke satt';
                }
            };

            observationInfo.addTo(map);
        };

        var getObsIcon = function (obs) {
            //var color = Utility.geoHazardColor(obs.GeoHazardTid);
            var color = 'white';
            var iconColor = '#444';
            if (obs.GeoHazardTid === 20) {
                color = 'beige';
                iconColor = '#FFF';
            } else if (obs.GeoHazardTid === 60) {
                color = 'blue';
                iconColor = '#FFF';
            } else if (obs.GeoHazardTid === 70) {
                color = 'cadetblue';
                iconColor = '#FFF';
            }
            return L.AwesomeMarkers.icon({
                icon: 'ion-flag',
                prefix: 'ion',
                markerColor: color,
                iconColor: iconColor,
                extraClasses: 'map-obs-marker-observation'
            });
        }

        var drawObservations = function () {
            observationsLayerGroup.clearLayers();
            Observations.getStoredObservations(Utility.getCurrentGeoHazardTid()).forEach(function (obs) {
                var latlng = new L.LatLng(obs.LatLngObject.Latitude, obs.LatLngObject.Longitude);
                var m = new L.Marker(latlng, { icon: getObsIcon(obs) });
                m.on('click',
                    function () {
                        $state.go('observationdetails', { observation: obs });
                    });
                m.addTo(observationsLayerGroup);
            });

        };

        var hideObservations = function () {
            observationsLayerGroup.clearLayers();
        };

        var updateNearbyLocations = function (lat, lng, distance, geoHazardTid) {
            return $q(function (resolve, reject) {
                Observations.getNearbyLocations(lat, lng, distance, geoHazardTid)
                    .then(function () {
                        drawStoredLocations();
                        resolve();
                    }).catch(reject);
            });
        };

        var drawStoredLocations = function () {
            locationLayerGroup.clearLayers();

            var geoHazardTid = Utility.getCurrentGeoHazardTid();
            var storedLocations = Observations.getLocations(geoHazardTid);
            storedLocations.forEach(function (loc) {
                var latlng = new L.LatLng(loc.LatLngObject.Latitude, loc.LatLngObject.Longitude);
                var geoHazardType = Utility.getGeoHazardType(loc.geoHazardId);
                var myIcon = L.divIcon({ className: 'my-div-icon', html: '<div class="nearby-location-marker ' + geoHazardType + '"><div class="nearby-location-marker-inner"></div></div>' });
                var m = L.marker(latlng, { icon: myIcon });
                m.on('click', function () { $state.go('locationdetails', { location: loc }) });
                m.addTo(locationLayerGroup);
            });
        };

        var hideLocations = function () {
            locationLayerGroup.clearLayers();
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

            observationInfo.update();
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

                //closePopup();

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
                observationInfo.update();
                createMarkerMenu();
                obsLocationMarker.openMenu();
                closeMarkerMenuTimer = $timeout(function () {
                    obsLocationMarker.closeMenu();
                }, 3000);
            }
        };

        var drawObsLocation = function (zoom) {
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
                                //openAndUpdatePopup(position);
                                observationInfo.updateFromLatLng(position);
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
                    observationInfo.update();
                }

                if (zoom) {
                    isProgramaticZoom = true;
                    map.setView(latlng, 9);
                    isProgramaticZoom = false;
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
            return dText;
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

        //var closePopup = function () {
        //    if (popup && map) {
        //        map.closePopup(popup);
        //    }
        //}

        //var openAndUpdatePopup = function (latlng) {
        //    if (userMarker && latlng) {
        //        var distance = userMarker.getLatLng().distanceTo(obsLocationMarker.getLatLng()).toFixed(0);
        //        var center = pathLine.getBounds().getCenter();
        //        if (!popup) {
        //            popup = L.popup().setLatLng(center).setContent(getDistanceText(distance));
        //        } else {
        //            popup.setLatLng(center).setContent(getDistanceText(distance));
        //        }
        //        popup.openOn(map);
        //    }
        //};

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
                    observationInfo.update();
                }

                if (zoom) {
                    isProgramaticZoom = true;
                    map.setView(latlng, 9);
                    isProgramaticZoom = false;
                }

                if (followMode) {
                    map.panTo(latlng);
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

        var disableFollowMode = function () {
            followMode = false;
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

            //TODO: Create LayerGroup object instead of many variables
            tilesLayerGroup = L.layerGroup().addTo(map);
            locationLayerGroup = L.layerGroup().addTo(map);
            observationsLayerGroup = L.layerGroup().addTo(map);
            markersLayerGroup = L.layerGroup().addTo(map);

            tiles = [];

            AppSettings.tiles.forEach(function (tile) {
                var t = L.tileLayerRegObs(tile.url, { folder: AppSettings.mapFolder, name: tile.name, debugFunc: AppLogging.log });
                tiles.push(t);
            });
            tiles[0].addTo(tilesLayerGroup);

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

            createObservationInfo();

            service.updateMapFromSettings();

            if (ObsLocation.isSet()) {
                drawObsLocation(true);
            } else {
                drawObsLocation(false);
            }

            //drawObservations();

            // map.invalidateSize();

            return map;
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
                var description = getDistanceText(distance);
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

        //var cancelUpdatePromise;

        service.updateObservationsInMap = function () {
            if (map) {
                var center = map.getCenter();
                var bounds = map.getBounds();
                var distance = bounds.getNorthWest().distanceTo(bounds.getSouthEast()).toFixed(0);
                var geoHazardTid = Utility.getCurrentGeoHazardTid();

                var workFunc = function (onProgress, cancel) {
                    return $q(function (resolve, reject) {
                        var canceled = false;
                        if (cancel) {
                            cancel.promise.then(function() {
                                canceled = true;
                                reject('Canceled');
                            });
                        }

                        var progress = new RegObs.ProggressStatus();
                        Observations.updateObservationsWithinRadius(center.lat, center.lng, distance, geoHazardTid, progress, onProgress, cancel)
                            .then(function () {
                                //TODO: Update nearby locations
                                resolve();
                            });
                        //TODO: Delete old registrations
                    });
                };

                RegobsPopup.downloadProgress('Oppdaterer kartet med det siste fra regObs', workFunc, { longTimoutMessageDelay: 10, closeOnComplete: true })
                    .then(function() {
                        AppLogging.log('progress completed');
                    })
                    .catch(function() {
                        AppLogging.log('progress cancelled');
                    });


                //var cancelUpdatePromise = $q.defer();

                //var updateCalls = [Observations.updateObservationsWithinRadius(center.lat, center.lng, distance, geoHazardTid, cancelUpdatePromise),
                //                    updateNearbyLocations(center.lat, center.lng, distance, geoHazardTid, cancelUpdatePromise)];

                //var scope = $rootScope.$new();
                //scope.tooLongTime = false;
                //scope.timer = 0;

                //var interval = $interval(function () {
                //    scope.timer += 1;
                //    if (scope.timer > 10) {
                //        scope.tooLongTime = true;
                //    }
                //}, 1000);

                //var myPopup = $ionicPopup.show({
                //    template: '<p ng-if="tooLongTime">Tjenesten bruker for mye tid. Det kan være dårlig internett der du er eller at regObs av andre grunner er utilgjengelig. Du kan vente eller avbryte og prøve igjen senere</p>',
                //    title: 'Oppdaterer kartet med det siste fra regObs',
                //    //subTitle: 'Please use normal things',
                //    scope: scope,
                //    buttons: [
                //        {
                //            text: '<b>Avbryt</b>',
                //            type: 'button-positive',
                //            onTap: function (e) {
                //                cancelUpdatePromise.resolve();
                //            }
                //        }
                //    ]
                //});

                //$q.all(updateCalls).then(function () {
                //    $interval.cancel(interval);
                //    drawObservations();
                //    myPopup.close();
                //});
            }
        };

        //service.cancelUpdateObservationInMap = function() {
        //    if (cancelUpdatePromise) {
        //        cancelUpdatePromise.resolve();
        //        cancelUpdatePromise = null;
        //    }
        //};

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

            drawObsLocation(false);
            observationInfo.update();
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