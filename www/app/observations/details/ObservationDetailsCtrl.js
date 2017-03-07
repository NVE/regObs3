angular
    .module('RegObs')
    .controller('ObservationDetailsCtrl', function ($stateParams, Utility) {
        var vm = this;
        vm.observation = $stateParams.observation;
        vm.getHazardName = Utility.geoHazardNames(this.observation.GeoHazardTid);
    });