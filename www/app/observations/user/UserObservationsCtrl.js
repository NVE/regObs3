angular
    .module('RegObs')
    .controller('UserObservationsCtrl', function ($scope, Observations, Registration, Observation, Utility, RegobsPopup) {
        var vm = this;

        vm.observations = [];
        vm.isLoading = false;

        vm._findById = function (id) {
            var found = vm.observations.filter(function (item) {
                return item.Id === id;
            });
            if (found.length > 0) {
                return found[0];
            } else {
                return null;
            }
        };

        vm._addUnsentObservations = function () {
            if (angular.isArray(Registration.unsent)) {
                Registration.unsent.forEach(function (item) {
                    if (!vm._findById(item.Id)) {
                        var obs = angular.copy(item);
                        obs.isLocal = true;
                        vm.observations.push(obs);
                    }
                });
            }
        };

        vm._updateObservationsFromServer = function () {
            var workFunc = function (onProgress, cancel) {
                return Observations.updateUserObservations(onProgress, cancel);
            };
            return RegobsPopup.downloadProgress('UPDATE_MY_OBSERVATIONS', workFunc, { longTimoutMessageDelay: 20, closeOnComplete: true });
        };


        vm.getGeoHazardName = function (item) {
            return Utility.getGeoHazardType(item.GeoHazardTid);
        };

        vm.update = function () {
            vm.isLoading = true;
            vm.observations = [];
            vm._addUnsentObservations();
            vm._updateObservationsFromServer().then(Observations.getStoredUserObservations).then(function (userObservations){
                vm.observations = vm.observations.concat(userObservations.map(function (item) { return Observation.fromJson(item); }));
            }).finally(function () {
                $scope.$broadcast('scroll.refreshComplete');
                vm.isLoading = false;
            });
        };

        $scope.$on('$ionicView.loaded',
            function () {
                vm.update();
            });

    });