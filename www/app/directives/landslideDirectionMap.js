/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .directive('landslideDirectionMap', function landslideDirectionMap(AppSettings, Registration) {
        function link(scope, elem, attrs) {
            var options = scope.leafletMap;
            console.log(options);
            elem.css('height', '100%');

            var start, stop;

            var center = [
                62.5,
                10
            ];

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
            map.addLayer(markers);

            var polyline = L.polyline([new L.LatLng(0,0),new L.LatLng(0,0)], {color: 'red'}).addTo(map);


            //pos.addTo(map);

            scope.$on('$destroy', function () {
                map.remove();
            });

            scope.$on('openLandslideInMap', function () {
                map.invalidateSize();
                var landSlideObs = Registration.data.LandSlideObs;

                if(!landSlideObs.StartLat){
                    start = undefined;
                    stop = undefined;
                    markers.clearLayers();
                    polyline.setLatLngs([new L.LatLng(0, 0), new L.LatLng(0, 0)]);
                    return;
                }

                if(landSlideObs.StopLat && !stop){
                    var stopPos = new L.LatLng(landSlideObs.StopLat,landSlideObs.StopLong);
                    stop = createPopup(stopPos, 'Stop');
                }
                if(landSlideObs.StartLat && !start){
                    var startPos = new L.LatLng(landSlideObs.StartLat,landSlideObs.StartLong);
                    start = createPopup(startPos, 'Start');
                } /* else if(start && !Registration.data.LandSlideObs.StartLat){
                    markers.clearLayers();
                    start = undefined;
                    stop = undefined;
                }*/
                if(start && stop){
                    polyline.setLatLngs([start.getLatLng(),stop.getLatLng()]);
                }

            });

            scope.$on('setLandslideInMap', function () {
                if(start){
                    var startLatLng = start.getLatLng();
                    Registration.data.LandSlideObs.StartLat = startLatLng.lat;
                    Registration.data.LandSlideObs.StartLong = startLatLng.lng;
                }
                if(stop){
                    var stopLatLng = stop.getLatLng();
                    Registration.data.LandSlideObs.StopLat = stopLatLng.lat;
                    Registration.data.LandSlideObs.StopLong = stopLatLng.lng;
                }
            });

            map.on('click', function (e) {
                //alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
                if(!start){
                    start = createPopup(e.latlng, 'Start');
                } else if(!stop){
                    stop = createPopup(e.latlng, 'Stop');
                }
                if(start && stop){
                    polyline.setLatLngs([start.getLatLng(),stop.getLatLng()]);
                }

            });

            function createPopup(latlng, text){
                var p = new L.marker(latlng, {draggable:'true'})
                    .bindPopup(text);

                p.on('dragend', function(){
                    var position = p.getLatLng();
                    console.log(position);
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



        }

        return {
            restrict: 'A',
            link: link,
            scope: {
                leafletMap: '='
            }
        };

    });