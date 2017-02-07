/**
 * Created by ingljo 07.02.2017
 */
angular
    .module('RegObs')
    .component('setPositionInMap',
    {
        templateUrl: 'app/directives/position/setPositionInMap.html',
        controller: function ($element, Map, $scope, AppSettings, AppLogging, $timeout, RegObsClasses, $filter, Utility, ObsLocation, UserLocation) {
            var ctrl = this;

            ctrl.hasMoved = false;
            ctrl.updateMarkerToGpsLocation = !ObsLocation.isSet() || ObsLocation.get().UTMSourceTID === ObsLocation.source.fetchedFromGPS;

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

            ctrl._getStartPosition = function () {
                if (ObsLocation.isSet()) {
                    var location = ObsLocation.get();
                    return L.latLng(location.Latitude, location.Longitude);
                } else {
                    return Map.getCenter();
                }
            };

            var marker = L.marker(ctrl._getStartPosition()).addTo(map);
            

            ctrl.centerMapMarker = function() {
                var center = map.getCenter();
                marker.setLatLng(center);
                $timeout(function () {
                    ctrl.hasMoved = true;
                    ctrl.updateMarkerToGpsLocation = false;
                    ctrl._updateDistance();
                });
            };

            map.on('drag', ctrl.centerMapMarker);
            map.on('zoom', function() {
                if (!ctrl.isProgramaticZoom) {
                    ctrl.centerMapMarker();
                }
            });

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

                    if (ctrl.updateMarkerToGpsLocation) {
                        marker.setLatLng(latlng);
                        map.panTo(latlng);                    
                    }

                    $timeout(function() {
                        ctrl._updateDistance();
                    });
                }
            };

            ctrl.resetToGps = function() {
                if (userMarker) {
                    var latlng = userMarker.getLatLng();
                    marker.setLatLng(latlng);
                    map.panTo(latlng);
                    ctrl.updateMarkerToGpsLocation = true;
                    ctrl._updateDistance();
                }
            };

            ctrl.showGpsReset = function() {
                return userMarker && !ctrl.updateMarkerToGpsLocation && ctrl.hasMoved;
            }


            ctrl._updateDistance = function () {
                ctrl._updateDistanceLine();
                ctrl._updateDistanceText();
            };

            var pathLine;
            ctrl._updateDistanceLine = function () {
                if (userMarker) {
                    var path = [marker.getLatLng(), userMarker.getLatLng()];
                    if (!pathLine) {
                        pathLine = L.polyline(path, { color: 'black', weight: 6, opacity: .5, dashArray: "10,10" }).addTo(map);
                    } else {
                        pathLine.setLatLngs(path);
                    }
                }
            };

            map.on('locationfound', ctrl._updateUserPosition);

            ctrl.getMarkerLatLngText = function () {
                var latLng = marker.getLatLng();
                var lat = $filter('number')(latLng.lat, 3);
                var lng = $filter('number')(latLng.lng, 3);
                return lat + 'N ' + lng + 'E ';
            };

            ctrl.distanceText = '';

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
                ctrl.onSave();
            };

            ctrl.isProgramaticZoom = true;
            map.setView(marker.getLatLng(), Map.getZoom());
            ctrl.isProgramaticZoom = false;

            $scope.$on('$destroy', function () {
                AppLogging.log('Stop watching gps position and destroy map');
                map.stopLocate();
                map.remove();
            });

            if (UserLocation.hasUserLocation()) {
                ctrl._updateUserPosition(UserLocation.getLastUserLocation());
            }


            ctrl.$onInit = function () {
                document.addEventListener("deviceready", function () {
                    AppLogging.log('Start watching gps location in SetPositionInMap');
                    map.locate({ watch: true, enableHighAccuracy: true });
                }, false);
            };        
        },
        bindings: {
            onSave: '&'
        }
    });
