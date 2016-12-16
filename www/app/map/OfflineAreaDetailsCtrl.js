angular
    .module('RegObs')
    .controller('OfflineAreaDetailsCtrl', function ($stateParams, $ionicLoading, AppLogging, $ionicHistory, RegobsPopup, OfflineMap, Utility) {
        var vm = this;

        vm.area = $stateParams.area;
        vm.bounds = L.latLngBounds(L.latLng(vm.area.bounds[0][0], vm.area.bounds[0][1]), L.latLng(vm.area.bounds[1][0], vm.area.bounds[1][1]));
        vm.humanFileSize = Utility.humanFileSize(vm.area.size, true);

        var showConfirm = function () {
            return RegobsPopup.confirm('Slett offline område',
                'Er du sikker på at du vil slette offline område ' + vm.area.name + '?');
        };

        vm.deleteMap = function () {
            showConfirm()
                .then(function (response) {
                    if (response) {
                        $ionicLoading.show();
                        OfflineMap.deleteOfflineArea(vm.area).then(function(result) {
                            AppLogging.log(JSON.stringify(result));
                        }).finally($ionicHistory.goBack);
                    }
                });
        };
    });