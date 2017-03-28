﻿angular
    .module('RegObs')
    .controller('ConfirmLocationCtrl', function ($document, Map, $scope, AppSettings, AppLogging, $timeout, RegObsClasses, $filter, Utility, ObsLocation, UserLocation, $http) {
        var ctrl = this;

        var map;
        var marker;
        var userMarker;

        ctrl.hasMoved = false;
        ctrl.updateMarkerToGpsLocation = !ObsLocation.isSet() || ObsLocation.get().UTMSourceTID === ObsLocation.source.fetchedFromGPS;
        ctrl.distanceText = '';
        ctrl.showDetails = false;

        ctrl.toggleDetails = function () {
            ctrl.showDetails = !ctrl.showDetails;
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

            var redMarker = L.AwesomeMarkers.icon({
                icon: 'record',
                prefix: 'ion',
                markerColor: 'red'
            });

            marker = L.marker(ctrl._getStartPosition(), { icon: redMarker }).addTo(map);
            marker.setZIndexOffset(1500);

            map.on('drag', ctrl.centerMapMarker);
            map.on('zoom', function () {
                if (!ctrl.isProgramaticZoom) {
                    ctrl.centerMapMarker();
                }
            });

            map.on('locationfound', ctrl._updateUserPosition);

            ctrl.isProgramaticZoom = true;
            map.setView(marker.getLatLng(), Map.getZoom());
            ctrl.isProgramaticZoom = false;

            if (UserLocation.hasUserLocation()) {
                ctrl._updateUserPosition(UserLocation.getLastUserLocation());
            }

            ctrl._updateLocationText();
        };

        ctrl._getStartPosition = function () {
            if (ObsLocation.isSet()) {
                var location = ObsLocation.get();
                return L.latLng(location.Latitude, location.Longitude);
            } else {
                return Map.getCenter();
            }
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
            marker.setLatLng(center);
            $timeout(function () {
                ctrl.hasMoved = true;
                ctrl.updateMarkerToGpsLocation = false;
                ctrl._updateDistance();
                ctrl._updateLocationText();
            });
        };

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

                if (ctrl.updateMarkerToGpsLocation) {
                    marker.setLatLng(latlng);
                    map.panTo(latlng);
                }

                $timeout(function () {
                    ctrl._updateDistance();
                });
            }
        };

        ctrl.resetToGps = function () {
            if (userMarker) {
                var latlng = userMarker.getLatLng();
                marker.setLatLng(latlng);
                map.panTo(latlng);
                ctrl.updateMarkerToGpsLocation = true;
                ctrl._updateDistance();
            }
        };

        ctrl.showGpsReset = function () {
            return userMarker && !ctrl.updateMarkerToGpsLocation && ctrl.hasMoved;
        };


        ctrl._updateDistance = function () {
            ctrl._updateDistanceLine();
            ctrl._updateDistanceText();
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
            var latLng = marker.getLatLng();
            var lat = $filter('number')(latLng.lat, 3);
            var lng = $filter('number')(latLng.lng, 3);
            return lat + 'N ' + lng + 'E ';
        };

        

        ctrl._updateDistanceText = function () {
            if (userMarker) {
                var distance = userMarker.getLatLng().distanceTo(marker.getLatLng());
                ctrl.distanceText = Utility.getDistanceText(distance);
            }
        };

        ctrl.savePosition = function () {
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
            ObsLocation.set(obsLoc);
        };

        

        $scope.$on('$destroy', function () {
            AppLogging.log('Destroy map');
            map.remove();
        });

        $scope.$on('$ionicView.loaded', function () {
            ctrl.loadMap();
        });

        $scope.$on('$ionicView.enter', function () {
            document.addEventListener("deviceready", function () {
                AppLogging.log('Start watching gps location in SetPositionInMap');
                map.locate({ watch: true, enableHighAccuracy: true });
            }, false);
        });

        $scope.$on('$ionicView.leave', function () {
            AppLogging.log('Stop watching gps position');
            map.stopLocate();
            if (ctrl._locationTextTimeout) {
                $timeout.cancel(ctrl._locationTextTimeput);
            }
        });
        
        
    });
