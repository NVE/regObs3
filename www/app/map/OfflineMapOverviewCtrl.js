angular
    .module('RegObs')
    .controller('OfflineMapOverviewCtrl', function ($ionicPlatform, $ionicLoading, $state, OfflineMap, AppLogging, $scope, Utility, RegobsPopup) {
        var vm = this;
        vm.offlineAreas = [];

        var load = function () {
            $ionicLoading.show();
            OfflineMap.getOfflineAreas()
               .then(function (result) {
                   AppLogging.log('Offline fetched ' + JSON.stringify(result));
                   vm.offlineAreas = result;
               }, function (error) {
                   AppLogging.log('Could not get offline area ' + JSON.stringify(error));
               }).finally(function () {
                   $ionicLoading.hide();
               });
        };

        var showConfirm = function () {
            return RegobsPopup.confirm('Slett offlinekart',
                'Er du sikker på at du vil slette alle områder som er lastet ned offline?');
        };

        vm.offlineAreDetailsClick = function (area) {
            $state.go('offlineareadetails', area);
        };

        vm.deleteMaps = function () {
            showConfirm()
                .then(function (response) {
                    if (response) {
                        $ionicLoading.show();
                        OfflineMap.deleteAllOfflineAreas()
                            .finally(load);
                    }
                });
        };

        vm.humanFileSize = function (bytes) {
            return Utility.humanFileSize(bytes, true);
        };


        $scope.$on('$ionicView.enter', load);
    });