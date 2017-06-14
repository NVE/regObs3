angular.module('RegObs').service('RegObsClasses', function (MapSelectableItem, Observation, StoredLocationMarker, ObservationMarker, MarkerClusterGroup, RegObsTileLayer, ObservationType, NewRegistrationMarker, UserMarker) {
    return {
        MapSelectableItem: MapSelectableItem,
        Observation: Observation,
        ObservationType: ObservationType,
        StoredLocationMarker: StoredLocationMarker,
        ObservationMarker: ObservationMarker,
        MarkerClusterGroup: MarkerClusterGroup,
        RegObsTileLayer: RegObsTileLayer,
        NewRegistrationMarker: NewRegistrationMarker,
        UserMarker: UserMarker,
    };
});