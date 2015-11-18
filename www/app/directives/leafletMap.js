/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .directive('leafletMap', function LeafletMap(ObsLocation) {
        function link(scope, elem, attrs) {
            var options = scope.leafletMap;
            console.log(options);
            elem.css('height', '100%');

            var map = L.map(elem[0], {
                center: [
                    ObsLocation.get()?ObsLocation.get().Latitude:64.871,
                    ObsLocation.get()?ObsLocation.get().Longitude:16.949
                ],
                zoom: 6,
                zoomControl:false,
                attributionControl: false
            });
            var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png');
            //var geoLayer = L.geoJson()


            map.addLayer(layer);

            scope.$on('$destroy', function() {
                map.remove();
            });

            scope.$on('setPositionInMap', function () {
                console.log('Posiition in map!');
                if(ObsLocation.get()){
                    var latlng = new L.LatLng(ObsLocation.get().Latitude, ObsLocation.get().Longitude);
                    map.panTo(latlng);
                    if(ObsLocation.get().Uncertainty) {
                        var radius = ObsLocation.get().Uncertainty/2;
                        L.circle(latlng, radius).addTo(map);
                    }
                }


            });

            function onLocationFound(e) {
                var radius = e.accuracy / 2;

                /*L.marker(e.latlng).addTo(map)
                 .bindPopup("You are within " + radius + " meters from this point").openPopup();*/

                L.circle(e.latlng, radius).addTo(map);
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