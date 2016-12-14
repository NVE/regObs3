angular
    .module('RegObs')
    .controller('OfflineMapOverviewCtrl', function ($ionicPlatform, $ionicLoading, $state, OfflineMap, AppLogging, $scope, Utility) {
        var vm = this;
        vm.offlineAreas = [];

        var load = function () {
            $ionicLoading.show();
            OfflineMap.getOfflineAreas()
               .then(function (result) {
                   AppLogging.log('Offline fetched' + JSON.stringify(result));
                   vm.offlineAreas = result;
               }, function (error) {
                   AppLogging.log('Could not get offline area ' + JSON.stringify(error));
               }).finally(function () {
                   $ionicLoading.hide();
               });
        };

        vm.downloadArea = function() {
            $state.go('mapareadownload');
        };

        vm.deleteMaps = function () {
            $ionicLoading.show();
            OfflineMap.deleteAllOfflineAreas()
                .finally(load);
        };

        vm.humanFileSize = function(bytes) {
            return Utility.humanFileSize(bytes, true);
        };

        $scope.$on('$ionicView.enter', load);
    });