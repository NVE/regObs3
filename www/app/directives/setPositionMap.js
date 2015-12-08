/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .directive('setPositionMap', function setPositionMap(ObsLocation, AppSettings) {
        function link(scope, elem, attrs) {
            var options = scope.leafletMap;
            console.log(options);
            elem.css('height', '100%');


            /*scope.$on('openPositionInMap', function () {
                scope.$applyAsync(function () {
                    mapboxgl.accessToken = 'pk.eyJ1Ijoia3N0b3JzdGVpbiIsImEiOiJjaWhlY2V6bTQwMDQ2dTltNG5oZm1udmpwIn0.9UXECYo4767bshimLp7B3w';
                    var map = new mapboxgl.Map({
                        container: 'map', // container id
                        style: 'mapbox://styles/mapbox/streets-v8', //stylesheet location
                        center: [-74.50, 40], // starting position
                        zoom: 9 // starting zoom
                    });
                });


            });*/



            var obsLoc;

            var center = [
                62.5,
                10
            ];

            var pos = L.circle(new L.LatLng(center[0], center[1]), 1);
            var marker;

            var map = L.map(elem[0], {
                center: center,
                zoom: 12,
                zoomControl: false,
                attributionControl: false
            });

            var layer = L.tileLayer(AppSettings.mapTileUrl);
            //var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png');

            map.addLayer(layer);
            pos.addTo(map);

            scope.$on('$destroy', function () {
                map.remove();
            });

            scope.$on('openPositionInMap', function () {
                map.invalidateSize();
                obsLoc = Object.create(ObsLocation.data);
                console.log('Posiition in map!');
                drawUserLocation(obsLoc);

            });

            scope.$on('setPositionInMap', function () {
                if (obsLoc) {
                    ObsLocation.set(obsLoc);
                }
            });

            map.on('click', function (e) {
                // alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);

                obsLoc = {
                    Latitude: e.latlng.lat.toString(),
                    Longitude: e.latlng.lng.toString(),
                    Uncertainty: 1 + '',
                    UTMSourceTID: ObsLocation.source.clickedInMap
                };
                drawUserLocation(obsLoc);

            });

            function drawUserLocation(obsLoc) {
                console.log('DRAWUSER');
                if (obsLoc.Latitude) {
                    var latlng = new L.LatLng(obsLoc.Latitude, obsLoc.Longitude);
                    map.panTo(latlng);
                    //map.setZoom(12);
                    if (obsLoc.Uncertainty) {
                        var radius = obsLoc.Uncertainty / 2;
                        pos.setLatLng(latlng);
                        pos.setRadius(radius);
                    }

                    if(!marker){
                        marker = new L.Marker(latlng);
                        marker.addTo(map);
                    } else {
                        marker.setLatLng(latlng);
                    }
                }
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
