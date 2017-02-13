angular.module('RegObs').service('RegObsClasses', function (MapSelectableItem, Observation, StoredLocationMarker, ObservationMarker, CurrentObsLocationMarker, MarkerClusterGroup, RegObsTileLayer, ObservationType) {
    return {
        MapSelectableItem: MapSelectableItem,
        Observation: Observation,
        ObservationType: ObservationType,
        StoredLocationMarker: StoredLocationMarker,
        ObservationMarker: ObservationMarker,
        CurrentObsLocationMarker: CurrentObsLocationMarker,
        MarkerClusterGroup: MarkerClusterGroup,
        RegObsTileLayer: RegObsTileLayer
    };
});