angular
    .module('RegObs')
    .factory('OfflineMap', function ($ionicPlatform, $window, $q, $cordovaFile, AppSettings, AppLogging) {
        var service = this;
        var metaFilename = 'offline-meta.json';
        var meta;

        service.getOfflineAreas = function () {
            return $q(function (resolve, reject) {
                if (meta) { //map metadata is loaded, return
                    resolve(meta);
                } else { //load map metadata from file
                    $cordovaFile.readAsText(cordova.file.dataDirectory, metaFilename)
                        .then(function (success) {
                            // success
                            meta = JSON.parse(success);
                            resolve(meta);
                        },function(error) {
                                if (error.code === 1) { //file does not exist
                                    service.saveOfflineAreas([]).then(resolve([]));
                                } else {
                                    reject(error);
                                }
                         });
                }
            });
        };

        service.saveOfflineAreas = function (metadata) {
            return $cordovaFile.writeFile(cordova.file.dataDirectory, metaFilename, JSON.stringify(metadata), true).then(function () {
                meta = metadata; //update saved metadata in memory
            });
        };

        service.deleteAllOfflineAreas = function () {
            return $q(function(resolve, reject) {
                $cordovaFile.removeRecursively(cordova.file.dataDirectory, AppSettings.mapFolder)
                    .then(function() {
                            service.saveOfflineAreas([]).then(resolve, reject);
                        },
                        function(error) {
                            AppLogging.log('Error deleting map folder: ' + JSON.stringify(error));
                            if (error.code === 1) { //directory does not exist
                                service.saveOfflineAreas([]).then(resolve);
                            } else {
                                reject(error);
                            }
                        });
            });
        };

        return service;
    });