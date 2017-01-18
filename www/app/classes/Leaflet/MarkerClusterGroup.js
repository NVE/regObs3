angular.module('RegObs').factory('MarkerClusterGroup', function (AppSettings) {

    /**
     * Stored location marker
     * @param {}  
     * @returns {} 
     */
    var MarkerClusterGroup = L.MarkerClusterGroup.extend({
        options: {
            icon: 'ion-flag',
            showCoverageOnHover: false,
            iconCreateFunction: function (cluster) {
                var appMode = AppSettings.getAppMode();
                var innerDiv = '<div class="observation-pin obs-marker-cluster ' + appMode + '"><div class="observation-pin-icon"><i class="ion ' + this.icon + '"></i>' + cluster.getChildCount() + '</div>';
                return L.divIcon({ html: innerDiv, className: 'observation-pin-cluster', iconSize: L.point(30, 30) });
            }
        }
    });

    return MarkerClusterGroup;
});