/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .directive('setPositionMap', function (ObsLocation, AppSettings, AppLogging, $state, $rootScope, Registration, Utility, Observations, Map) {
        'ngInject';
        function link(scope, elem, attrs) {
            //var marker, userMarker, pathLine, popup, markerMenu, firstLoad = true, isDragging = false;
            var options = scope.leafletMap;
            AppLogging.log(options);
            elem.css('height', '100%');

            Map.createMap(elem[0]);

            //var center = [
            //    62.5,
            //    10
            //];
            //if (ObsLocation.isSet()) {
            //    var currentPosition = ObsLocation.get();
            //    center = [currentPosition.Latitude, currentPosition.Longitude];
            //}

            //var map = L.map(elem[0], {
            //    center: center,
            //    zoom: 5,
            //    zoomControl: false,
            //    attributionControl: false
            //});
            //Map.map = map;

            //var layer = L.tileLayerCordova(AppSettings.mapTileUrl, { folder: 'regobsMapData', name: 'Topomap' });
            //Map.topomap = layer;

            //var steepnessLayer = L.tileLayerCordova(AppSettings.steepnessMapTileUrl, { folder: 'regobsMapData', name: 'Steepnessmap' });
            //Map.steepnessmap = steepnessLayer;

            //var tilesLayerGroup = L.layerGroup().addLayer(layer).addTo(map);
            //var observationsLayerGroup = L.layerGroup().addTo(map);
            //var markersLayerGroup = L.layerGroup().addTo(map);

            //var icon = L.AwesomeMarkers.icon({ icon: 'arrow-move', prefix: 'ion', markerColor: 'green', extraClasses: 'map-obs-marker' });
            //var iconSet = L.AwesomeMarkers.icon({ icon: 'ion-flag', prefix: 'ion', markerColor: 'gray', extraClasses: 'map-obs-marker map-obs-marker-set' });


            //map.on('locationfound',
            //   function (position) {
            //       drawUserLocation({
            //           Latitude: position.latitude,
            //           Longitude: position.longitude,
            //           Uncertainty: position.accuracy
            //       },
            //           !ObsLocation.isSet() && firstLoad);
            //       firstLoad = false;
            //   });

            //map.on('locationerror',
            //    function (e) {
            //        AppLogging.log('GPS error: ' + e.message);
            //    });

            //var clearWatch = function () {
            //    AppLogging.log('Stop watching gps location');
            //    map.stopLocate();
            //}

            //var startWatch = function () {
            //    AppLogging.log('Start watching gps location');
            //    document.addEventListener("deviceready", function () {
            //        map.locate({ watch: true, enableHighAccuracy: true });
            //    }, false);
            //};

            //var addSteepnessMap = function () {
            //    tilesLayerGroup.addLayer(steepnessLayer);
            //};

            //var removeSteepnessMap = function () {
            //    if (steepnessLayer) {
            //        tilesLayerGroup.removeLayer(steepnessLayer);
            //    }
            //};

            scope.$on('$destroy', function () {
                Map.clearWatch();
                //map.remove();
            });

            scope.$on('startGpsWatch', function () {
                Map.invalidateSize();
                Map.startWatch();
            });

            scope.$on('endGpsWatch', function () {
                Map.clearWatch();
            });

            scope.$on('centerMapPosition', function () {
                //if (userMarker) {
                //    AppLogging.log('Center map to user marker');
                //    if (map) {
                //        map.panTo(userMarker.getLatLng());
                //    }
                //}
                Map.centerMapToUser();
            });

            //var updateMapFromSettings = function () {
            //    if (AppSettings.data.showSteepnessMap) {
            //        addSteepnessMap();
            //    } else {
            //        removeSteepnessMap();
            //    }

            //    if (steepnessLayer) {
            //        steepnessLayer.setOpacity(AppSettings.data.steepnessMapOpacity);
            //    }
            //};

            $rootScope.$on('$regObs.appSettingsChanged', function () {
                Map.updateMapFromSettings();
            });          

            //var drawObservations = function () {
            //    observationsLayerGroup.clearLayers();
            //    Observations.observations.forEach(function (obs) {
            //        var obsIcon = L.AwesomeMarkers.icon({ icon: 'ion-flag', prefix: 'ion', markerColor: 'white', iconColor: '#444', extraClasses: 'map-obs-marker-observation' });
            //        var latlng = new L.LatLng(obs.LatLngObject.Latitude, obs.LatLngObject.Longitude);
            //        var m = new L.Marker(latlng, { icon: obsIcon });
            //        m.addTo(observationsLayerGroup);
            //    });
            //};

            //var updateObservationsInMap = function () {
            //    var center = map.getCenter();
            //    var bounds = map.getBounds();
            //    var distance = bounds.getNorthWest().distanceTo(bounds.getSouthEast()).toFixed(0);
            //    var geoHazardTid = Utility.getCurrentGeoHazardTid();
            //    Observations.updateObservationsWithinRadius(center.lat, center.lng, distance, geoHazardTid).then(drawObservations);
            //};

            scope.$on('updateObservationsInMap', function () {
                Map.updateObservationsInMap();
            });

            //var startTrip = function () {
            //    if (AppSettings.getAppMode() === 'snow') {
            //        $state.go('snowtrip');
            //    }
            //};

            //var removeMarkerMenu = function () {
            //    if (marker) {
            //        marker.removeMenu();
            //    }
            //};

            //var clearObsLocation = function () {
            //    ObsLocation.remove();
            //    if (userMarker) {
            //        drawObsLocation(userMarker.getLatLng(), false);
            //        updateDistanceLine(false);
            //    }
            //    removeMarkerMenu();
            //    if (marker) {
            //        marker.setIcon(icon);
            //    }
            //}

            //var getMarkerMenuItems = function () {
            //    var mode = AppSettings.getAppMode();
            //    var items = [];
            //    items.push({
            //        title: Utility.getNewObservationText(),
            //        click: function () { // callback function fired on click. this points to item
            //            Registration.createAndGoToNewRegistration();
            //        },
            //        menuIcon: "ion-plus"
            //    });
            //    if (mode === 'snow') {
            //        items.push({
            //            title: 'Meld fra om tur',
            //            click: function () {
            //                startTrip();
            //            },
            //            menuIcon: "ion-android-walk"
            //        });
            //    }
            //    items.push({
            //        title: 'Fjern markering',
            //        className: "red-circle",
            //        click: function () {
            //            clearObsLocation();
            //        },
            //        menuIcon: "ion-close"
            //    });

            //    return items;
            //};



            //var createMarkerMenu = function () {
            //    if (marker) {
            //        if (!markerMenu) {
            //            markerMenu = L.markerMenu({
            //                radius: 55, // radius of the circle,
            //                size: [34, 34], // menu items width and height
            //                items: getMarkerMenuItems()
            //            });
            //            marker.setMenu(markerMenu);
            //        }
            //    }
            //};



            //function drawObsLocation(zoom) {
            //    AppLogging.log('DRAW Current Obs position');
            //    var latlng;
            //    if (ObsLocation.isSet()) {
            //        latlng = L.latLng(ObsLocation.get().Latitude, ObsLocation.get().Longitude);
            //    } else if (userMarker) {
            //        latlng = userMarker.getLatLng();
            //    } else {
            //        latlng = center;
            //    }

            //    if (latlng) {
            //        if (!marker) {
            //            marker = new L.Marker(latlng, { icon: icon, draggable: 'true' });
            //            marker.on('dragstart', function (event) {
            //                isDragging = true;
            //            });

            //            marker.on('drag', function (event) {
            //                var marker = event.target;
            //                var position = marker.getLatLng();
            //                updateDistanceLineLatLng(position, true);
            //                openAndUpdatePopup(position);
            //            });
            //            marker.on('dragend', function (event) {
            //                var marker = event.target;
            //                closePopup();
            //                marker.setIcon(iconSet);
            //                var position = marker.getLatLng();
            //                var obsLoc = {
            //                    Latitude: position.lat.toString(),
            //                    Longitude: position.lng.toString(),
            //                    Uncertainty: '0',
            //                    UTMSourceTID: ObsLocation.source.clickedInMap
            //                }
            //                ObsLocation.set(obsLoc);
            //                isDragging = false;
            //                updateDistanceLine(true);
            //                createMarkerMenu();
            //            });
            //            marker.addTo(markersLayerGroup);
            //        } else {
            //            marker.setLatLng(latlng);
            //        }

            //        if (ObsLocation.isSet()) {
            //            marker.setIcon(iconSet);
            //            createMarkerMenu();
            //            updateDistanceLine(true);
            //        }

            //        if (zoom) {
            //            map.setView(latlng, 9);
            //        }
            //    }
            //}

            //function getDistanceText(distance) {
            //    var dText;
            //    if (distance > 1000) {
            //        dText = (distance / 1000).toFixed(1) + ' km';
            //    } else {
            //        dText = (distance || 0) + ' m';
            //    }
            //    return dText + ' til observasjonspunkt';
            //}

            //function updateDistanceLineLatLng(latlng) {
            //    if (userMarker && latlng) {
            //        var path = [latlng, userMarker.getLatLng()];
            //        if (!pathLine) {
            //            pathLine = L.polyline(path, { color: 'black', weight: 6, opacity: .5, dashArray: "10,10" }).addTo(markersLayerGroup);
            //        } else {
            //            pathLine.setLatLngs(path);
            //        }
            //    }
            //}

            //function closePopup() {
            //    if (popup && map) {
            //        map.closePopup(popup);
            //    }
            //}

            //function openAndUpdatePopup(latlng) {
            //    if (userMarker && latlng) {
            //        var distance = userMarker.getLatLng().distanceTo(marker.getLatLng()).toFixed(0);
            //        var center = pathLine.getBounds().getCenter();
            //        if (!popup) {
            //            popup = L.popup().setLatLng(center).setContent(getDistanceText(distance));
            //        } else {
            //            popup.setLatLng(center).setContent(getDistanceText(distance));
            //        }
            //        popup.openOn(map);
            //    }
            //}

            //function updateDistanceLine() {
            //    if (ObsLocation.isSet() && userMarker) {
            //        var obsLoc = ObsLocation.get();
            //        var latlng = new L.LatLng(obsLoc.Latitude, obsLoc.Longitude);
            //        updateDistanceLineLatLng(latlng);
            //    } else {
            //        if (pathLine) {
            //            markersLayerGroup.removeLayer(pathLine);
            //            pathLine = null;
            //        }
            //    }
            //}

            //function drawUserLocation(obsLoc, zoom) {
            //    AppLogging.log('DRAW user position');
            //    if (obsLoc.Latitude && obsLoc.Longitude) {
            //        var latlng = new L.LatLng(obsLoc.Latitude, obsLoc.Longitude);

            //        var accuracy = obsLoc.Uncertainty || 1;

            //        if (!userMarker) {
            //            userMarker = L.userMarker(latlng, { pulsing: true, accuracy: accuracy, smallIcon: true });
            //            userMarker.addTo(markersLayerGroup);
            //        } else {
            //            userMarker.setLatLng(latlng);
            //        }

            //        if (!isDragging) {
            //            drawObsLocation(false);
            //        }

            //        if (zoom) {
            //            map.setView(latlng, 9);
            //        }
            //    }
            //}



            $rootScope.$on('$regobs.appModeChanged', function () {
                //markerMenu = null;
                //createMarkerMenu();
                Map.changeAppMode();
            });

            //var init = function () {
            //    AppLogging.log('setPositionMap init');
            //    map.invalidateSize();

            //    updateMapFromSettings();

            //    if (ObsLocation.isSet()) {
            //        drawObsLocation(true);
            //    } else {
            //        drawObsLocation(false);
            //    }

            //    drawObservations();
            //};

            //init();

        }

        return {
            restrict: 'A',
            link: link,
            scope: {
                leafletMap: '='
            }
        };

    });
