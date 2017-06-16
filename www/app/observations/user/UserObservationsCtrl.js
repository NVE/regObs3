angular
    .module('RegObs')
    .controller('UserObservationsCtrl', function ($scope, Observations, Registration) {
        var vm = this;

        vm.observations = [];
        vm.pageSize = 20;
        vm.page = 0;

        vm.isLoading = true;

        vm.update = function () {
            vm.page = 0;
            vm.observations = [];
            vm.isLoading = true;
            vm.redraw();
            //Map.updateObservationsInMap().then(vm.redraw);
        };

        vm.loadMore = function () {
            vm.page++;
            vm.isLoading = true;
            vm.redraw();
        };

        vm.updateFromButton = function () {
            vm.update();
        };

        vm.redraw = function () {
            vm.isLoading = true;

            var unsavedObservations = Registration.unsent;
            //vm.observations = unsavedObservations;
            Observations.updateUserObservations(vm.pageSize, vm.page).then(function (result) {
                //vm.observations = result.Results;
                //angular.merge(vm.observations, result.Results);
                vm.observations = vm.observations.concat(result.Results);

                $scope.$broadcast('scroll.refreshComplete');
                $scope.$broadcast('scroll.infiniteScrollComplete');
                vm.isLoading = false;
            });

            //$scope.$broadcast('scroll.refreshComplete');
            //vm.isLoading = false;

            

            //Map.getObservationsWithinViewBounds()
            //    .then(function (result) {
            //        vm.observations = result;
            //    }).finally(function () {
            //        // Stop the ion-refresher from spinning
            //        $scope.$broadcast('scroll.refreshComplete');
            //        vm.isLoading = false;
            //    });
        };

        $scope.$on('$ionicView.enter',
            function () {
                vm.redraw();
            });
    });