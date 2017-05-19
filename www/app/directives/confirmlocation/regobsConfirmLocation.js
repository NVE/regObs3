(function () {
    'use strict';

    var regobsConfirmPosition = {
        bindings: {
            savePosition: '&',
            positionDescription: '@',
            startPosition: '<',
            showPreviouslyUsedLocations: '<',
            startZoom: '<'
        },
        templateUrl: 'app/directives/confirmlocation/confirmlocation.html',
        controller: function ($document, Map, $rootScope, $scope, $translate, AppSettings, AppLogging, $timeout, RegObsClasses, $filter, Utility, ObsLocation, UserLocation, $http, $q, Observations, $state, $ionicHistory, $stateParams, Registration) {
            var ctrl = this;

            var map;
            var marker;
            var userMarker;

            ctrl.distanceText = '';
            ctrl.showDetails = false;
            ctrl._httpTimeout = $q.defer();
            ctrl.updateMarkerToGpsLocation = !ctrl.startPosition;

            ctrl.toggleDetails = function () {
                ctrl.showDetails = !ctrl.showDetails;
            };

            ctrl._addSupportTiles = function () {
                var geoId = Utility.getCurrentGeoHazardTid();
                AppSettings.data.maps.forEach(function (mapSetting) {
                    if (mapSetting.geoHazardTid === geoId) {
                        if (mapSetting.tiles) {
                            mapSetting.tiles.forEach(function (tileSetting) {
                                if (tileSetting.visible) {
                                    var tile = AppSettings.getTileByName(tileSetting.name);
                                    if (tile) {
                                        var t = new RegObsClasses.RegObsTileLayer(tile.url, { reuseTiles: false, folder: AppSettings.mapFolder, name: tile.name, embeddedUrl: tile.embeddedUrl, embeddedMaxZoom: tile.embeddedMaxZoom, debugFunc: AppSettings.debugTiles ? AppLogging.debug : null });
                                        if (tileSetting.opacity) {
                                            t.setOpacity(tileSetting.opacity);
                                        }
                                        map.addLayer(t);
                                    }
                                }
                            });
                        }
                    }
                });
            };

            ctrl.loadMap = function () {
                var div = document.getElementById('confirm-map');

                map = L.map(div, {
                    zoomControl: false,
                    attributionControl: false,
                    maxZoom: AppSettings.maxMapZoomLevel
                });

                L.control.scale({ imperial: false, position: 'topright' }).addTo(map);

                var tile = AppSettings.tiles[0];

                var layer = new RegObsClasses.RegObsTileLayer(tile.url,
                    {
                        reuseTiles: false,
                        folder: AppSettings.mapFolder,
                        name: tile.name,
                        embeddedUrl: tile.embeddedUrl,
                        embeddedMaxZoom: tile.embeddedMaxZoom,
                        debugFunc: AppSettings.debugTiles ? AppLogging.debug : null
                    });
                map.addLayer(layer);

                ctrl._addSupportTiles();

                var infotext = $translate.instant(AppSettings.getAppMode().toUpperCase());
                var iconPostFix = AppSettings.getAppMode();
                var infoControl = L.control.infoControl({ text: infotext, icon: 'nve-icon nve-icon-' + iconPostFix }).addTo(map);


                ctrl._clusteredGroup = new RegObsClasses.MarkerClusterGroup().addTo(map);

                var redMarker = L.AwesomeMarkers.icon({
                    icon: 'record',
                    prefix: 'ion',
                    markerColor: 'red'
                });
                //var redMarker = L.regobsMarker({ showCircle: true });

                marker = L.marker(ctrl._getStartPosition(), { icon: redMarker }).addTo(map);

                marker.setZIndexOffset(1500);

                map.on('drag', ctrl.centerMapMarker);
                map.on('locationfound', ctrl._updateUserPosition);

                ctrl.isProgramaticZoom = true;
                map.setView(marker.getLatLng(), ctrl.startZoom || Map.getZoom());
                ctrl.isProgramaticZoom = false;

                if (UserLocation.hasUserLocation()) {
                    ctrl._updateUserPosition(UserLocation.getLastUserLocation());
                }

                ctrl._updateLocationText();

                if (ctrl.showPreviouslyUsedLocations) {
                    map.on('moveend', ctrl._refreshLocationsWithTimeout);
                    map.on('zoomend', function () {
                        if (!ctrl.isProgramaticZoom) {
                            ctrl._refreshLocationsWithTimeout();
                        }
                    });

                    ctrl.loadPlaces();

                    if (Utility.hasMinimumNetwork()) {
                        ctrl._refreshLocationsWithTimeout();
                    }
                }

                document.addEventListener("deviceready", function () {
                    AppLogging.log('Start watching gps location in SetPositionInMap');
                    map.locate({ watch: true, enableHighAccuracy: true });
                }, false);
            };

            ctrl._getStartPosition = function () {
                if (ctrl.startPosition) {
                    return L.latLng(ctrl.startPosition.Latitude, ctrl.startPosition.Longitude);
                }
                return Map.getCenter();
            };

            ctrl._updateLocationText = function () {
                if (ctrl._locationTextTimeout) {
                    $timeout.cancel(ctrl._locationTextTimeout);
                    AppLogging.log('cancel timeout');
                }
                ctrl._locationTextTimeout = $timeout(function () {
                    AppLogging.log('run update name');
                    var latlng = marker.getLatLng();
                    $http.get(AppSettings.getEndPoints().getLocationName, {
                        params: {
                            latitude: latlng.lat,
                            longitude: latlng.lng
                        },
                        timeout: AppSettings.httpConfig.timeout
                    }).then(function (response) {
                        ctrl.locationText = response.data.Data;
                    });

                }, 1000); //update location if not moved in 1 sec
            };

            ctrl.centerMapMarker = function () {
                var center = map.getCenter();
                ctrl.updateMarkerToGpsLocation = false;
                ctrl.setPositionManually(center);
            };

            ctrl.setPositionManually = function (latlng) {
                marker.setLatLng(latlng);
                ctrl._unselectAllMarkers();
                ctrl.place = null;
                ctrl._updateLocationText();
                ctrl._updateDistance();
            };

            ctrl._updateUserPosition = function (position) {
                AppLogging.log('updateUserPosition');
                if (position) {
                    UserLocation.setLastUserLocation(position);
                    var latlng = L.latLng(position.latitude, position.longitude);
                    if (!userMarker) {
                        userMarker = new RegObsClasses.UserMarker(latlng, { accuracy: position.accuracy });
                        userMarker.addTo(map);
                    } else {
                        userMarker.setLatLng(latlng);
                        userMarker.setAccuracy(position.accuracy);
                    }

                    if (ctrl.updateMarkerToGpsLocation) {
                        marker.setLatLng(latlng);
                        map.panTo(latlng);
                    }
                    ctrl._updateDistance();
                }
            };

            ctrl.resetToGps = function () {
                if (userMarker) {
                    var latlng = userMarker.getLatLng();
                    ctrl.updateMarkerToGpsLocation = true;
                    ctrl.setPositionManually(latlng);
                    map.panTo(latlng);
                }
            };


            ctrl._updateDistance = function () {
                $timeout(function () {
                    ctrl._updateDistanceLine();
                    ctrl._updateDistanceText();
                });
            };

            var pathLine;
            ctrl._updateDistanceLine = function () {
                if (userMarker) {
                    var path = [marker.getLatLng(), userMarker.getLatLng()];
                    if (!pathLine) {
                        pathLine = L.polyline(path, { color: 'black', weight: 6, opacity: .9, dashArray: "1,12" }).addTo(map);
                    } else {
                        pathLine.setLatLngs(path);
                    }
                }
            };



            ctrl.getMarkerLatLngText = function () {
                if (marker) {
                    var latLng = marker.getLatLng();
                    //return Utility.ddToDms(latLng.lat, latLng.lng);
                    return Utility.formatLatLng(latLng.lat, latLng.lng);
                }
                return '';
            };



            ctrl._updateDistanceText = function () {
                if (userMarker) {
                    var distance = userMarker.getLatLng().distanceTo(marker.getLatLng());
                    ctrl.distanceText = Utility.getDistanceText(distance);
                }
            };

            ctrl.loadingLocations = false;

            ctrl._refreshLocations = function () {
                var center = map.getCenter();
                var bounds = map.getBounds();
                var zoom = map.getZoom();
                var radius = Utility.getRadiusFromBounds(bounds);
                var geoHazardTid = Utility.getCurrentGeoHazardTid();

                if (!ctrl._lastCenter || (ctrl._lastCenter.distanceTo(center) > (AppSettings.data.searchRange / 2)) || ctrl._lastZoom !== zoom) {
                    ctrl._lastCenter = center;
                    ctrl._lastZoom = zoom;
                    ctrl.loadingLocations = true;
                    Observations.updateNearbyLocations(center.lat, center.lng, radius, geoHazardTid, ctrl._httpTimeout)
                        .then(function () {
                            $timeout(function () {
                                ctrl.loadingLocations = false;
                            });
                            ctrl.loadPlaces();
                        });
                } else {
                    ctrl.loadPlaces();
                }
            };

            ctrl._refreshLocationsWithTimeout = function () {
                if (ctrl._refreshLocationTimeout) {
                    $timeout.cancel(ctrl._refreshLocationTimeout);
                }
                if (ctrl._httpTimeout) {
                    ctrl._httpTimeout.reject(); //reject previous calls
                }

                ctrl._httpTimeout = $q.defer();
                ctrl._refreshLocationTimeout = $timeout(ctrl._refreshLocations, 500);
            };

            ctrl._setSelectedItem = function (item) {
                $timeout(function () {
                    ctrl._unselectAllMarkers(item);
                    ctrl.place = item;
                    ctrl.locationText = null;
                    var latlng = item.getLatLng();
                    marker.setLatLng(latlng);
                    ctrl.updateMarkerToGpsLocation = false;
                    ctrl._updateDistance();
                    map.panTo(latlng);
                    ctrl.showDetails = true;
                });
            };

            ctrl._unselectAllMarkers = function (except) {
                var unselectFunc = function (arr) {
                    arr.forEach(function (item) {
                        if (item !== except) {
                            if (item.setUnselected) {
                                item.setUnselected();
                            }
                        }
                    });
                };
                unselectFunc(ctrl._clusteredGroup.getLayers());
            };

            ctrl._getMarker = function (id) {
                var existingLayers = ctrl._clusteredGroup.getLayers().filter(function (item) {
                    if (item.getId) {
                        return item.getId() === id;
                    } else {
                        return false;
                    }
                });
                if (existingLayers.length > 0) {
                    return existingLayers[0];
                }

                return null;
            };

            ctrl.loadPlaces = function () {
                Observations.getLocations(Utility.getCurrentGeoHazardTid(), map.getBounds()).forEach(function (loc) {
                    var m = new RegObsClasses.StoredLocationMarker(loc);

                    if (!ctrl._getMarker(m.getId())) {
                        m.on('selected', function (event) {
                            ctrl._setSelectedItem(event.target);
                        });
                        m.addTo(ctrl._clusteredGroup);

                        if (ctrl.startPosition && ctrl.startPosition.UTMSourceTID === ObsLocation.source.storedPosition) {
                            if (m.getId() === ctrl.startPosition.ObsLocationId) {
                                m.setSelected();
                            }
                        }
                    }
                });
            };


            ctrl.savePositionClick = function () {
                var latlng = marker.getLatLng();
                var accuracy = "0";
                if (ctrl.updateMarkerToGpsLocation && UserLocation.hasUserLocation()) {
                    accuracy = UserLocation.getLastUserLocation().accuracy.toString();
                }
                var obsLoc = {
                    Latitude: latlng.lat.toString(),
                    Longitude: latlng.lng.toString(),
                    Uncertainty: accuracy,
                    UTMSourceTID: ctrl.updateMarkerToGpsLocation ? ObsLocation.source.fetchedFromGPS : ObsLocation.source.clickedInMap
                };

                var place;

                if (ctrl.place) {
                    obsLoc.UTMSourceTID = ObsLocation.source.storedPosition;
                    obsLoc.Latitude = ctrl.place.storedLocation.LatLngObject.Latitude;
                    obsLoc.Longitude = ctrl.place.storedLocation.LatLngObject.Longitude;
                    place = ctrl.place.storedLocation;
                }

                ctrl.savePosition({ pos: obsLoc, place: place });
            };

            ctrl.$onDestroy = function () {
                AppLogging.log('Stop watching gps position');
                map.stopLocate();

                if (ctrl._locationTextTimeout) {
                    $timeout.cancel(ctrl._locationTextTimeput);
                }
                if (ctrl._refreshLocationTimeout) {
                    $timeout.cancel(ctrl._refreshLocationTimeout);
                }
                if (ctrl._httpTimeout) {
                    ctrl._httpTimeout.reject(); //stop loading locations
                }

                AppLogging.log('Destroy map');
                map.remove();
            };

            ctrl.$onInit = function () {
                if (!map) {
                    ctrl.loadMap();
                }
            };
           
        }
    };

    angular
        .module('RegObs')
        .component('regobsConfirmPosition', regobsConfirmPosition);
})();