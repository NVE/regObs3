angular
    .module('RegObs')
    .controller('MapAreaDownloadCtrl', function ($ionicPlatform, $ionicLoading, $filter, $ionicScrollDelegate, OfflineMap, AppLogging, AppSettings, Map, $cordovaFile, $cordovaDevice, $ionicPopup, $scope, $pbService, $state, $timeout, Utility, $translate, PresistentStorage, RegobsPopup) {
        var vm = this;
        vm._fragmentsFromBaseMap = 0;
        vm._calculateLevelSteps = 2;
        vm._maxCalculateLevels = 6;
        vm.size = 0;
        vm.tooBigSize = false;
        vm.availableDiskspace = '';
        vm.availableDiskspaceBytes = 0;
        vm.mapFragmentCount = 0;
        vm.maxMapZoomLevel = AppSettings.maxMapZoomLevel;
        vm.maps = angular.copy(AppSettings.tiles);
        vm.maps.forEach(function (item) {
            item.selected = false;
        });
        vm.maps[0].selected = true; //Topo map is selected as default
        vm.isLoading = true;
        vm.name = '';
        vm._baseLevels = [{ extraLevels: 0, description: $translate.instant('NONE') }];

        vm._getEstimatedSize = function (zoomlevel) {
            var fragments = Map.calculateXYZSizeFromBounds(vm.bounds, 1, zoomlevel);
            var selectedMaps = vm.maps.filter(function (item) { return item.selected; });
            var tiles = 0;
            var bytes = 0;
            selectedMaps.forEach(function(m) {
                tiles += fragments;
                bytes += fragments * m.avgTileSize;
            });
            var humanSize = Utility.humanFileSize(bytes, true);
            return { humanSize: humanSize, bytes: bytes, tiles: tiles };
        };     

        vm.extraDetailLevel = angular.copy(vm._baseLevels);
        vm.selectedDetailLevel = vm._calculateLevelSteps;

        vm._calculateDetailLevels = function () {
            vm.extraDetailLevel = angular.copy(vm._baseLevels);
            if (vm.currentZoom) {
                for (var currentLevel = vm._calculateLevelSteps; vm.currentZoom + currentLevel <= AppSettings.maxMapZoomLevel && currentLevel <= vm._maxCalculateLevels; currentLevel += vm._calculateLevelSteps) {
                    var size = vm._getEstimatedSize(vm.currentZoom + currentLevel);
                    if (size.bytes < vm.availableDiskspaceBytes) {
                        vm.extraDetailLevel.push({
                            extraLevels: currentLevel,
                            description: '+' + currentLevel + ' (' + size.humanSize + ')'
                        });
                    } else {
                        AppLogging.log('Detail size ' + currentLevel + ' ' + size.humanSize + ' is larger than available ' + vm.availableDiskspace);
                        break;
                    }
                }
            }

            //Setting selected detail level to one less if levels has changed and selected value is bigger
            if (vm.extraDetailLevel[vm.extraDetailLevel.length - 1].extraLevels < vm.selectedDetailLevel) {
                vm.selectedDetailLevel = vm.extraDetailLevel[vm.extraDetailLevel.length - 1].extraLevels;
            }
        };

        vm.zoomlevel = function () {
            return (vm.currentZoom || 0) + vm.selectedDetailLevel;
        };

        vm.selectedMaps = function () {
            return vm.maps.filter(function (item) {
                return item.selected;
            }).length;
        };

        vm.mapsWithLimitReached = function () {
            return vm.maps.filter(function (item) {
                return item.limitReached === true;
            });
        };

        vm.anyMapLimitReached = function () {
            return vm.mapsWithLimitReached().length > 0;
        };

        var checkMaxLimits = function () {
            vm.maps.forEach(function (item) {
                item.limitReached = false;
                if (item.selected) {
                    if (vm._fragmentsFromBaseMap > item.maxDownloadLimit) {
                        item.limitReached = true;
                    }
                }
            });
        };

        vm.updateCounts = function () {
            if (vm.bounds) {
                vm._calculateDetailLevels();
                var estimatedSize = vm._getEstimatedSize(vm.zoomlevel());
                vm.mapFragmentCount = estimatedSize.tiles;
                vm.size = estimatedSize.humanSize;
                if (estimatedSize.bytes > vm.availableDiskspaceBytes) {
                    vm.tooBigSize = true;
                } else {
                    vm.tooBigSize = false;
                }
                checkMaxLimits();
            }
        };

        vm.downloadDisabled = function () {
            return vm.tooBigSize || vm.selectedMaps() === 0 || vm.anyMapLimitReached();
        }

        var updateFreeDiskSpace = function () {
            return PresistentStorage.getFreeDiskSpace()
                    .then(function (success) {
                        vm.availableDiskspaceBytes = success;
                        vm.availableDiskspace = Utility.humanFileSize(vm.availableDiskspaceBytes, true);
                    }).catch(function(error) {
                        AppLogging.warn('Could not get available diskspace. ' + JSON.stringify(error));
                        vm.availableDiskspace = $translate.instant('UNKNOWN');
                    }).finally(vm.updateCounts);
        };

        var downloadMap = function (onProgress, cancel) {
            var mapsToDownload = [];
            vm.maps.forEach(function (item) {
                if (item.selected) {
                    mapsToDownload.push(item.name);
                }
            });

            return OfflineMap.downloadMapFromBounds(vm.name, vm.bounds, 1,
                vm.zoomlevel(),
                mapsToDownload,
                onProgress,
                onProgress,
                cancel);
        };

        vm.download = function () {
            RegobsPopup.downloadProgress('Oppdaterer kartet med det siste fra regObs',
                downloadMap,
                { closeOnComplete: false })
            .then(function () {
                $state.go('start');
            })
            .catch(function () {
                AppLogging.log('progress cancelled');
                $state.go('start');
            });
        };


        var init = function () {
            vm.isLoading = true;
            vm.name = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $ionicLoading.show();

            updateFreeDiskSpace().finally(function () {
                vm.isLoading = false;
                $ionicLoading.hide();
                $ionicScrollDelegate.resize();
            });
        };

        $scope.$on('$ionicView.enter', init);
    });