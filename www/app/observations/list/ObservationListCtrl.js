﻿angular
    .module('RegObs')
    .controller('ObservationListCtrl', function ($scope, Observations, Utility, RegObsClasses, Map) {
        var vm = this;

        vm.observations = [];
        vm.isLoading = true;

        vm.update = function () {
            Map.updateObservationsInMap().then(vm.redraw);
        };

        vm.updateFromButton = function () {
            vm.update();
        };

        vm.redraw = function () {
            vm.isLoading = true;
            vm.observations = [];
            Observations.getStoredObservations(Utility.getCurrentGeoHazardTid())
                .then(function (result) {
                    result.forEach(function (obsJson) {
                        var o = new RegObsClasses.Observation(obsJson);
                        if (Map.isPositionWithinMapBounds(o.Latitude, o.Longitude)) {
                            vm.observations.push(o);
                        }
                    });
                }).finally(function () {
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                    vm.isLoading = false;
                });
        };

        $scope.$on('$ionicView.enter',
            function () {
                vm.redraw();
            });


    });