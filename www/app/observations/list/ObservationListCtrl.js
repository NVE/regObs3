angular
    .module('RegObs')
    .controller('ObservationListCtrl', function ($scope, Observations, Utility, RegObsClasses) {
        var vm = this;

        vm.observations = [];

        vm.redraw = function() {
            Observations.getStoredObservations(Utility.getCurrentGeoHazardTid())
                .then(function (result) {
                    result.forEach(function (obsJson) {
                        vm.observations.push(new RegObsClasses.Observation(obsJson));
                    });
                }).finally(function () {
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                });
        };

        vm.redraw();
    });