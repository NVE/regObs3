/**
 * Created by ingljo 14.12.2016
 */
angular
    .module('RegObs')
    .component('mapAreaSelect',
    {
        template: '<div class="map-area-select" data-tap-disabled="true"></div>',
        controller: function ($element, Map, $scope, AppSettings, AppLogging, $timeout) {
            var ctrl = this;
            var center = Map.getCenter();
            var zoom = Map.getZoom();
            var changeTimer;

            var div = $element.find('div')[0];
            var map = L.map(div, {
                center: center,
                zoom: zoom,
                zoomControl: false,
                attributionControl: false,
                maxZoom: AppSettings.maxMapZoomLevel
            });

            var change = function () {
                $timeout(function() {
                        ctrl.bounds = map.getBounds();
                        if (ctrl.onChange) {
                            ctrl.onChange();
                        }
                    },0);
            };

            map.on('moveend', change);
            map.on('zoomend', change);

            var layer = L.tileLayer(AppSettings.mapTileUrl());
            map.addLayer(layer);

            change();

            $scope.$on('$destroy', function () {
                if (changeTimer) {
                    $timeout.cancel(changeTimer);
                }
                map.remove();
            });
        },
        bindings: {
            bounds: '=',
            onChange: '&'
        }
    });
