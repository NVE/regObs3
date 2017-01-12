angular.module('RegObs').service('RegObsClasses', function (MapSelectableItem, Observation, StoredLocationMarker, ObservationMarker, CurrentObsLocationMarker) {
    return {
        MapSelectableItem: MapSelectableItem,
        Observation: Observation,
        StoredLocationMarker: StoredLocationMarker,
        ObservationMarker: ObservationMarker,
        CurrentObsLocationMarker: CurrentObsLocationMarker
    };
});