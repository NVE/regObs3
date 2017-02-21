angular
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
            Map.getObservationsWithinViewBounds()
                .then(function (result) {
                    vm.observations = result;
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