/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .directive('landslideDirectionMap', function landslideDirectionMap(AppSettings, Registration, ObsLocation, AppLogging) {
        'ngInject';
        function link(scope, elem, attrs) {

            elem.css('height', '100%');

            var start, stop;
            var startIcon = L.AwesomeMarkers.icon({icon: 'play', prefix: 'ion', markerColor: 'green'});
            var endIcon = L.AwesomeMarkers.icon({icon: 'stop', prefix: 'ion', markerColor: 'red'});

            var center = [
                62.5,
                10
            ];

            var pos = L.circle(new L.LatLng(center[0], center[1]), 1);

            //var pos = L.circle(new L.LatLng(center[0], center[1]), 1);

            var map = L.map(elem[0], {
                center: center,
                zoom: 12,
                zoomControl: false,
                attributionControl: false
            });



            var layer = L.tileLayer(AppSettings.mapTileUrl);
            var markers = new L.FeatureGroup();
            //var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png');

            map.addLayer(layer);
            pos.addTo(map);
            map.addLayer(markers);

            var polyline = L.polyline([new L.LatLng(0,0),new L.LatLng(0,0)], {color: 'red'}).addTo(map);


            //pos.addTo(map);

            scope.$on('$destroy', function () {
                map.remove();
            });

            scope.$on('openLandslideInMap', function () {
                map.invalidateSize();
                var landSlideObs = Registration.data[scope.landslideDirectionMap];
                if(!start){
                    var obsLoc = Object.create(ObsLocation.get());
                    drawUserLocation(obsLoc);
                }

                if(!landSlideObs.StartLat){
                    start = undefined;
                    stop = undefined;
                    markers.clearLayers();
                    polyline.setLatLngs([new L.LatLng(0, 0), new L.LatLng(0, 0)]);
                    return;
                }

                if(landSlideObs.StopLat && !stop){
                    var stopPos = new L.LatLng(landSlideObs.StopLat,landSlideObs.StopLong);
                    stop = createPopup(stopPos, 'Stop', endIcon);
                }
                if(landSlideObs.StartLat && !start){
                    var startPos = new L.LatLng(landSlideObs.StartLat,landSlideObs.StartLong);
                    start = createPopup(startPos, 'Start', startIcon);
                } /* else if(start && !Registration.data[scope.landslideDirectionMap].StartLat){
                    markers.clearLayers();
                    start = undefined;
                    stop = undefined;
                }*/
                if(start && stop){
                    polyline.setLatLngs([start.getLatLng(),stop.getLatLng()]);
                }

            });

            scope.$on('setLandslideInMap', function () {
                var landSlideObs = Registration.data[scope.landslideDirectionMap];
                if(start){
                    var startLatLng = start.getLatLng();
                    landSlideObs.StartLat = startLatLng.lat.toString();
                    landSlideObs.StartLong = startLatLng.lng.toString();
                }
                if(stop){
                    var stopLatLng = stop.getLatLng();
                    landSlideObs.StopLat = stopLatLng.lat.toString();
                    landSlideObs.StopLong = stopLatLng.lng.toString();
                }
            });

            map.on('click', function (e) {
                //alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
                if(!start){
                    start = createPopup(e.latlng, 'Start', startIcon);
                } else if(!stop){
                    stop = createPopup(e.latlng, 'Stop', endIcon);
                }
                if(start && stop){
                    polyline.setLatLngs([start.getLatLng(),stop.getLatLng()]);
                }

            });

            function createPopup(latlng, text, icon){
                /*var p = new L.circle(new L.LatLng(center[0], center[1]), 1)                */
                var p = new L.marker(latlng, {icon: icon, draggable: true})
                    .bindPopup(text, {
                        closeButton: false,
                        closeOnClick: false
                    });

                p.on('dragend', function(){
                    var position = p.getLatLng();
                    AppLogging.log(position);
                    map.panTo(position);
                    p.openPopup();

                });
                p.on('dragstart', function(){
                    p.openPopup();

                });
                p.on('drag', function () {
                    if(start && stop){
                        polyline.setLatLngs([start.getLatLng(),stop.getLatLng()]);
                    }
                });
                p.addTo(markers);
                p.openPopup();
                return p;
            }

            function drawUserLocation(obsLoc) {
                AppLogging.log('DRAWUSER');
                if (obsLoc.Latitude) {
                    var latlng = new L.LatLng(obsLoc.Latitude, obsLoc.Longitude);
                    var p = new L.Marker(latlng);
                    p.addTo(map);
                    map.panTo(latlng);
                    //map.setZoom(12);
                    if (obsLoc.Uncertainty) {
                        var radius = obsLoc.Uncertainty / 2;
                        pos.setLatLng(latlng);
                        pos.setRadius(radius);
                    }
                }
            }



        }

        return {
            restrict: 'A',
            link: link,
            scope: {
                landslideDirectionMap: '@'
            }
        };

    });
