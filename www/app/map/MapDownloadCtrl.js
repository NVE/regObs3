angular
    .module('RegObs')
    .controller('MapDownloadCtrl', function ($scope, $ionicPopup, AppSettings, AppLogging, Map, $cordovaFile, $timeout, $cordovaDevice, $pbService, $q, $ionicLoading, $ionicScrollDelegate) {
        var vm = this;

        var averageMapPartSize = 51887;
        var maxMapFragments = 10000;

        vm.maps = AppSettings.tiles;
        vm.maps.forEach(function (item) {
            item.selected = false;
        });
        vm.maps[0].selected = true;

        function humanFileSize(bytes, si) {
            var thresh = si ? 1000 : 1024;
            if (Math.abs(bytes) < thresh) {
                return bytes + ' B';
            }
            var units = si
                ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
                : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
            var u = -1;
            do {
                bytes /= thresh;
                ++u;
            } while (Math.abs(bytes) >= thresh && u < units.length - 1);
            return bytes.toFixed(1) + ' ' + units[u];
        }

        vm.selectedMaps = function () {
            return vm.maps.filter(function (item) {
                return item.selected;
            }).length;
        };

        vm.zoomlevel = 5;

        vm.mapFragmentCount = 0;
        vm.size = 0;
        vm.maxMapZoomLevel = AppSettings.maxMapZoomLevel;
        vm.tooBigSize = false;
        vm.availableDiskspace = '';
        vm.availableDiskspaceBytes = 0;
        vm.limitReached = false;
        vm.downloadAgain = false;

        vm.updateCounts = function () {
            var fragmentsFromBaseMap = Map.calculateXYZSize(1, vm.zoomlevel);
            vm.mapFragmentCount = fragmentsFromBaseMap * vm.selectedMaps();
            var bytes = vm.mapFragmentCount * averageMapPartSize;
            vm.size = humanFileSize(bytes, true);
            if (bytes > vm.availableDiskspaceBytes) {
                vm.tooBigSize = true;
            } else {
                vm.tooBigSize = false;
            }
            if (fragmentsFromBaseMap > maxMapFragments) {
                vm.limitReached = true;
            } else {
                vm.limitReached = false;
            }
        };

        vm.downloadDisabled = function () {
            return vm.tooBigSize || vm.selectedMaps() === 0 || vm.limitReached;
        }

        var cancel = false;
        $scope.cancelDownload = function () {
            cancel = true;
        };

        $scope.downloadComplete = function () {
            return $scope.downloadStatus && $scope.downloadStatus.complete;
        };

        $scope.closePopup = function () {
            if (vm.popup) {
                vm.popup.close();
                init();
            }
        };

        $scope.progressOptions = {
            color: '#333',
            // This has to be the same size as the maximum width to
            // prevent clipping
            strokeWidth: 4,
            trailWidth: 1,
            easing: 'easeInOut',
            duration: 10,
            from: { color: '#aaa', width: 1 },
            to: { color: '#333', width: 4 },
            // Set default step function for all animate calls
            step: function (state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.path.setAttribute('stroke-width', state.width);
                var text = '<i class="icon ion-ios-cloud-download"></i><div class="downloadprogress-percent">' + $scope.downloadStatus.percent + '%</div><div class="downloadprogress-value">(' + $scope.downloadStatus.done + '/' + $scope.downloadStatus.total + ')' + '</div>';
                circle.setText(text);
            }
        };

        var updateUsage = function () {
            return $q(function (resolve) {
                if (!vm.maps) {
                    resolve();
                } else {
                    var callbacks = 0;
                    var checkCallbacks = function () {
                        if (callbacks === vm.maps.length) {
                            resolve();
                        }
                    }
                    vm.maps.forEach(function (item) {
                        var tile = Map.getTileByName(item.name);
                        tile.getDiskUsage(function (filecount, bytes) {
                            $timeout(function () {
                                item.filecount = filecount;
                                item.bytes = bytes;
                                item.bytesReadable = humanFileSize(bytes, true);
                                callbacks++;

                                checkCallbacks();
                            }, 0);
                        });
                    });
                }
            });
        };

        var downloadMap = function () {
            var mapsToDownload = [];
            vm.maps.forEach(function (item) {
                if (item.selected) {
                    mapsToDownload.push(item.name);
                }
            });

            Map.downloadMap(1,
                vm.zoomlevel,
                mapsToDownload,
                function (status) {
                    $timeout(function () {
                        $scope.downloadStatus = status;
                        $pbService.animate('progress', (status.percent / 100.0));
                        AppLogging.log('Map download progress: ' + JSON.stringify(status));
                    }, 0);
                },
                function (status) {
                    $timeout(function () {
                        $scope.downloadStatus = status;
                        $pbService.animate('progress', 1.0);
                        AppLogging.log('Map download complete: ' + JSON.stringify(status));
                        
                    }, 0);
                },
                function () {
                    return cancel;
                });
        };

        var showProgress = function () {
            vm.popup = $ionicPopup.show({
                templateUrl: 'app/map/mapdownloadprogress.html',
                title: 'Laster ned kartblad',
                scope: $scope
            });
        };

        vm.download = function () {
            showProgress();
            downloadMap();
        };

        vm.deleteMaps = function () {
            Map.emptyCache().then(function () {
                updateUsage();
            });
        };



        vm.hasMapDownloaded = function () {
            return vm.maps.filter(function (item) {
                return item.filecount > 0;
            }).length > 0;
        };

        vm.addZoomLevel = function () {
            if (vm.zoomlevel < AppSettings.maxMapZoomLevel) {
                vm.zoomlevel++;
                vm.updateCounts();
            }
        };

        vm.subtractZoomLevel = function () {
            if (vm.zoomlevel > 1) {
                vm.zoomlevel--;
                vm.updateCounts();
            }
        };

        var updateFreeDiskSpace = function() {
            return $cordovaFile.getFreeDiskSpace()
                    .then(function (success) {
                        var ios = $cordovaDevice.getDevice() && $cordovaDevice.getDevice().platform === 'iOS';
                        vm.availableDiskspaceBytes = success * (ios ? 1 : 1000);
                        //ios returns result in bytes, and android in kB
                        vm.availableDiskspace = humanFileSize(vm.availableDiskspaceBytes, true);
                    },
                    function (error) {
                        AppLogging.warn('Could not get available diskspace. ' + JSON.stringify(error));
                        vm.availableDiskspace = 'Ukjent';
                    }).then(vm.updateCounts);
        };      

        var init = function() {
            vm.isLoading = true;
            $ionicLoading.show();
            cancel = false;
            vm.downloadAgain = false;

            updateUsage().then(updateFreeDiskSpace).then(function () {
                vm.isLoading = false;
                $ionicLoading.hide();
                $ionicScrollDelegate.resize();
            });
        };

        init();
    });