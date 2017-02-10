/**
 * Created by ingljo 08.02.2017
 */
angular
    .module('RegObs')
    .component('selectPreviousUsedPlaceInMap',
    {
        templateUrl: 'app/directives/position/selectPreviousUsedPlaceInMap.html',
        controller: function ($element, Map, $scope, AppSettings, AppLogging, $timeout, RegObsClasses, $filter, Utility, ObsLocation, UserLocation, Observations) {
            var ctrl = this;

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

            map.on('locationfound', ctrl._updateUserPosition);

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
                map.stopLocate();
                map.remove();
            });

            ctrl._setSelectedItem = function (item) {
                $timeout(function () {
                    ctrl.place = item;
                    item.setSelected();
                    ctrl._updateDistance();
                    map.panTo(item.getLatLng());
                });
            }
            ctrl.loadPlaces = function () {
                Observations.getLocations(Utility.getCurrentGeoHazardTid()).forEach(function (loc) {
                    var m = new RegObsClasses.StoredLocationMarker(loc);
                    m.on('selected', function (event) {
                        ctrl._setSelectedItem(event.target);
                    });
                    m.addTo(ctrl._clusteredGroup);
                    if (ObsLocation.isSet()) {
                        var currentLocation = ObsLocation.get();
                        if (currentLocation.UTMSourceTID === ObsLocation.source.storedPosition) {
                            if (m.getId() === currentLocation.ObsLocationId) {
                                ctrl._setSelectedItem(m);
                            }
                        }
                    }
                });
            };

            ctrl.init = function () {
                ctrl.loadPlaces();

                if (UserLocation.hasUserLocation()) {
                    ctrl._updateUserPosition(UserLocation.getLastUserLocation());
                }
                document.addEventListener("deviceready", function () {
                    AppLogging.log('Start watching gps location in SetPositionInMap');
                    map.locate({ watch: true, enableHighAccuracy: true });
                }, false);
            };

            ctrl.$onInit = ctrl.init;
        },
        bindings: {
            onSave: '&'
        }
    });
