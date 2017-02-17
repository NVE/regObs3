﻿/**
 * Created by ingljo 08.02.2017
 */
angular
    .module('RegObs')
    .component('selectPreviousUsedPlaceInMap',
    {
        templateUrl: 'app/directives/position/selectPreviousUsedPlaceInMap.html',
        controller: function ($element, Map, $scope, AppSettings, AppLogging, $timeout, RegObsClasses, $filter, Utility, ObsLocation, UserLocation, Observations, $q) {
            var ctrl = this;

            ctrl._httpTimeout = $q.defer();
            ctrl.place = null; //No place selected

            var div = $element[0].children[0].children[0].children[0];
            var map = L.map(div, {
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

            ctrl._clusteredGroup = new RegObsClasses.MarkerClusterGroup().addTo(map);

            var userMarker;
            ctrl._updateUserPosition = function (position) {
                AppLogging.log('updateUserPosition');
                if (position) {
                    UserLocation.setLastUserLocation(position);
                    var latlng = L.latLng(position.latitude, position.longitude);
                    if (!userMarker) {
                        userMarker = L.userMarker(latlng, { pulsing: true, accuracy: position.accuracy, smallIcon: true, zIndexOffset: 1000 });
                        userMarker.addTo(map);
                    } else {
                        userMarker.setLatLng(latlng);
                        userMarker.setAccuracy(position.accuracy);
                    }

                    $timeout(function () {
                        ctrl._updateDistance();
                    });
                }
            };

            ctrl._updateDistance = function () {
                ctrl._updateDistanceText();
            };

            ctrl.loadingLocations = false;

            ctrl._refreshLocations = function () {
                if (ctrl._refreshLocationTimeout) {
                    $timeout.cancel(ctrl._refreshLocationTimeout);
                }
                if (ctrl._httpTimeout) {
                    ctrl._httpTimeout.reject(); //reject previous calls
                }

                ctrl._httpTimeout = $q.defer();

                ctrl._refreshLocationTimeout = $timeout(function () {
                    var center = map.getCenter();
                    var bounds = map.getBounds();
                    var radius = parseInt((bounds.getNorthWest().distanceTo(bounds.getSouthEast()) / 2).toFixed(0));
                    var geoHazardTid = Utility.getCurrentGeoHazardTid();
                    ctrl.loadingLocations = true;
                    Observations.updateNearbyLocations(center.lat, center.lng, radius, geoHazardTid, ctrl._httpTimeout)
                        .then(function () {
                            ctrl.loadPlaces();
                        }).finally(function () {
                            ctrl.loadingLocations = false;
                        });
                }, 500);
            };

            map.on('locationfound', ctrl._updateUserPosition);
            map.on('moveend', ctrl._refreshLocations);
            map.on('zoomend', ctrl._refreshLocations);

            ctrl.distanceText = '';

            ctrl._updateDistanceText = function () {
                if (userMarker && ctrl.place) {
                    var distance = userMarker.getLatLng().distanceTo(ctrl.place.getLatLng());
                    ctrl.distanceText = Utility.getDistanceText(distance);
                }
            };

            ctrl.savePosition = function () {
                if (ctrl.place) {
                    var storedLocation = ctrl.place.getStoredLocation();

                    ObsLocation.setPreviousUsedPlace(storedLocation.LocationId,
                        storedLocation.Name,
                        {
                            Latitude: storedLocation.LatLngObject.Latitude.toString(),
                            Longitude: storedLocation.LatLngObject.Longitude.toString(),
                            Uncertainty: '0',
                            UTMSourceTID: ObsLocation.source.storedPosition
                        });

                    ctrl.onSave();
                }
            };

            map.setView(Map.getCenter(), Map.getZoom());

            $scope.$on('$destroy', function () {
                AppLogging.log('Stop watching gps position and destroy map');
                if (ctrl._refreshLocationTimeout) {
                    $timeout.cancel(ctrl._refreshLocationTimeout);
                }
                if (ctrl._httpTimeout) {
                    ctrl._httpTimeout.reject(); //stop loading locations
                }
                map.stopLocate();
                map.remove();
            });

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

            ctrl._setSelectedItem = function (item) {
                $timeout(function () {
                    ctrl._unselectAllMarkers(item);
                    ctrl.place = item;
                    ctrl._updateDistance();
                    map.panTo(item.getLatLng());
                });
            }

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
                Observations.getLocations(Utility.getCurrentGeoHazardTid()).forEach(function (loc) {
                    var m = new RegObsClasses.StoredLocationMarker(loc);

                    if (!ctrl._getMarker(m.getId())) {
                        m.on('selected', function (event) {
                            ctrl._setSelectedItem(event.target);
                        });
                        m.addTo(ctrl._clusteredGroup);

                        if (ObsLocation.isSet()) {
                            var currentLocation = ObsLocation.get();
                            if (currentLocation.UTMSourceTID === ObsLocation.source.storedPosition) {
                                if (m.getId() === currentLocation.ObsLocationId) {
                                    m.setSelected();
                                }
                            }
                        }
                    }
                });
            };

            ctrl.init = function () {
                if (UserLocation.hasUserLocation()) {
                    ctrl._updateUserPosition(UserLocation.getLastUserLocation());
                }
                document.addEventListener("deviceready", function () {
                    AppLogging.log('Start watching gps location in SetPositionInMap');
                    map.locate({ watch: true, enableHighAccuracy: true });
                }, false);

                ctrl.loadPlaces();

                if (Utility.hasMinimumNetwork()) {
                    ctrl._refreshLocations();
                }
            };

            ctrl.$onInit = ctrl.init;
        },
        bindings: {
            onSave: '&'
        }
    });
