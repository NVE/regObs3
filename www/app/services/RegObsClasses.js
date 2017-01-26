angular.module('RegObs').service('RegObsClasses', function (MapSelectableItem, Observation, StoredLocationMarker, ObservationMarker, CurrentObsLocationMarker, MarkerClusterGroup, RegObsTileLayer) {
    return {
        MapSelectableItem: MapSelectableItem,
        Observation: Observation,
        StoredLocationMarker: StoredLocationMarker,
        ObservationMarker: ObservationMarker,
        CurrentObsLocationMarker: CurrentObsLocationMarker,
        MarkerClusterGroup: MarkerClusterGroup,
        RegObsTileLayer: RegObsTileLayer
    };
});