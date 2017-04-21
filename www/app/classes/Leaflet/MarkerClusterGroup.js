angular.module('RegObs').factory('MarkerClusterGroup', function (AppSettings, ObservationMarker, StoredLocationMarker) {

    /**
     * Stored location marker
     * @param {}  
     * @returns {} 
     */
    var MarkerClusterGroup = L.MarkerClusterGroup.extend({
        options: {
            maxClusterRadius: 30, //default is 80
            showCoverageOnHover: false, //default is true
            iconCreateFunction: function (cluster) {
                var appMode = AppSettings.getAppMode();
                var childPins = cluster.getAllChildMarkers();
                var observations = childPins.filter(function (item) { return item instanceof ObservationMarker });
                var storedLocations = childPins.filter(function (item) { return item instanceof StoredLocationMarker });
                var iconClass = 'obs-marker-cluster-icons';
                if (observations.length >= 100 || storedLocations.length >= 100) {
                    iconClass += ' obs-marker-cluster-small-font'
                }
                if (observations.length > 0 && storedLocations.length > 0) {
                    iconClass += ' obs-marker-cluster-two-line'
                }
                var innerDiv = '<div class="observation-pin obs-marker-cluster ' + appMode + '"><div class="observation-pin-icon"><div class="' + iconClass + '">';
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