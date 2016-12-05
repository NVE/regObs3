angular
    .module('RegObs')
    .controller('MapDownloadCtrl', function ($scope, AppSettings, AppLogging, Map, $cordovaFile) {
        var vm = this;

        var averageMapPartSize = 33610;

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

        vm.mapFragmentCount = function () {
            return Map.calculateXYZList().length * vm.selectedMaps();
        };



        vm.size = function () {
            return humanFileSize(vm.mapFragmentCount() * averageMapPartSize, true);
        }

        vm.availableDiskspace = '';

        vm.download = function () {
            var xyzList = Map.calculateXYZList();
            AppLogging.log('XYZList: ' + JSON.stringify(xyzList));
        };

        vm.deleteMaps = function () {
            Map.emptyCache();
        };

        $cordovaFile.getFreeDiskSpace().then(function (success) {
                vm.availableDiskspace = humanFileSize(success, true);
            },function (error) {
               vm.availableDiskspace = 'Ukjent';
       });
    });