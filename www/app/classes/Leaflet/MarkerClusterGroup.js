angular.module('RegObs').factory('MarkerClusterGroup', function (AppSettings, ObservationMarker, StoredLocationMarker) {

    /**
     * Stored location marker
     * @param {}  
     * @returns {} 
     */
    var MarkerClusterGroup = L.MarkerClusterGroup.extend({
        options: {
            showCoverageOnHover: false,
            iconCreateFunction: function (cluster) {
                var appMode = AppSettings.getAppMode();
                var childPins = cluster.getAllChildMarkers();
                var observations = childPins.filter(function (item) { return item instanceof ObservationMarker });
                var storedLocations = childPins.filter(function (item) { return item instanceof StoredLocationMarker });
                var innerDiv = '<div class="observation-pin obs-marker-cluster ' + appMode + '"><div class="observation-pin-icon"><div class="obs-marker-cluster-icons ' +(observations.length > 0 && storedLocations.length > 0 ? 'obs-marker-cluster-two-line' : '') + '">';
                if (observations.length > 0) {
                    innerDiv += '<div><i class="icon ion-eye"></i>' + observations.length +'</div>';
                }
                if (storedLocations.length > 0) {
                    innerDiv += '<div><i class="icon ion-pin"></i>' + storedLocations.length + '</div>';
                }

                innerDiv += '</div></div></div>';
                return L.divIcon({ html: innerDiv, className: 'observation-pin-cluster', iconSize: L.point(30, 30) });
            }
        }
    });

    return MarkerClusterGroup;
});