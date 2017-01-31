angular
    .module('RegObs')
    .component('regobsPosition',
    {
        templateUrl: 'app/directives/position/regobsposition.html',
        controller: function ($element, ObsLocation, $state, $filter) {
            var ctrl = this;
            ctrl.location = ObsLocation.get();

            ctrl.hasPosition = function() {
                return ObsLocation.isSet();
            }

            ctrl.hasGpsPosition = function() {
                return ctrl.location && ctrl.location.UTMSourceTID === ObsLocation.source.fetchedFromGPS;
            };
            ctrl.isStoredLocation = function () {
                return ctrl.location && ctrl.location.UTMSourceTID === ObsLocation.source.storedPosition;
            };
            ctrl.hasMarkedPosition = function () {
                return ctrl.location && ctrl.location.UTMSourceTID === ObsLocation.source.clickedInMap;
            };

            ctrl.getDescription = function() {
                if (ctrl.location.ObsLocationId) {
                    return ctrl.location.Name;
                } else if (ctrl.location.place) {
                    return ctrl.location.place.Navn + ' / ' + ctrl.location.place.Fylke;
                } else if (ctrl.location.Latitude && ctrl.location.Longitude) {
                    var lat = $filter('number')(ctrl.location.Latitude, 3);
                    var lng = $filter('number')(ctrl.location.Longitude, 3);
                    return lat + 'N ' + lng + 'E ';
                }
                return 'UNKNOWN_POSITION';
            };

            ctrl.goBack = function() {
                $state.go('start');
            };

        },
        bindings: {

        }
    });