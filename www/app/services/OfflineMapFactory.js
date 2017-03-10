angular
    .module('RegObs')
    .factory('OfflineMap', function ($ionicPlatform, $window, $q, AppSettings, AppLogging, Map, PresistentStorage, RegobsPopup, $translate) {
        var service = this;
        var metaFilename = 'offline-meta.json';
        var meta;

        service.getOfflineAreas = function () {
            return $q(function (resolve, reject) {
                if (meta) { //map metadata is loaded, return
                    resolve(meta);
                } else { //load map metadata from file
                    PresistentStorage.readAsText(metaFilename)
                        .then(function (success) {

                            try {
                                // success
                                meta = JSON.parse(success);
                                resolve(meta);
                            }catch(e)
                            {
                                //json not parsed correctly, probably force quit app when storing to file
                                service.saveOfflineAreas([]).then(resolve([]));
                            }
                        }, function (error) {
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
            return PresistentStorage.storeFile(metaFilename, JSON.stringify(metadata)).then(function () {
                meta = metadata; //update saved metadata in memory
            });
        };

        service.deleteAllOfflineAreas = function () {
            return $q(function (resolve, reject) {
                PresistentStorage.removeRecursively(AppSettings.mapFolder)
                    .then(function () {
                        service.saveOfflineAreas([]).then(resolve, reject);
                    },
                        function (error) {
                            AppLogging.log('Error deleting map folder: ' + JSON.stringify(error));
                            if (error.code === 1) { //directory does not exist
                                service.saveOfflineAreas([]).then(resolve);
                            } else {
                                reject(error);
                            }
                        });
            });
        };

        var existsInOtherOfflineMap = function (map, xyzCoordinate, areas) {
            var found = false;
            areas.forEach(function (area) {
                var mapExists = area.maps.filter(function (item) { return item === map }).length > 0;
                if (mapExists) {
                    var coordinateExists = area.xyzList.filter(function (item) {
                        return item.x === xyzCoordinate.x &&
                            item.y === xyzCoordinate.y &&
                            item.z === xyzCoordinate.z;
                    }).length > 0;
                    if (coordinateExists) {
                        found = true; //Another offline map has this coordinate for current map
                        return;
                    }
                }
            });
            return found;
        };

        service.deleteOfflineArea = function (area) {
            if (!area) throw Error('area parameter not set!');
            return $q(function (resolve, reject) {
                var otherAreas = meta.filter(function (item) { return item.name !== area.name });
                var deleted = 0;
                var skipped = 0;
                var error = 0;
                var checkDone = function () {
                    if ((deleted + skipped + error) === area.tiles) {
                        meta = otherAreas;
                        service.saveOfflineAreas(meta)
                            .finally(function () {
                                resolve({ deleted: deleted, skipped: skipped, error: error });
                            });
                    }
                }
                var callbackSuccess = function () {
                    deleted++;
                    checkDone();
                };
                var callbackError = function (e) {
                    AppLogging.log('cold not delete file. Error: ' + JSON.stringify(e));
                    error++;
                    checkDone();
                };
                var callbackSkip = function () {
                    skipped++;
                    checkDone();
                };

                area.xyzList.forEach(function (xyzCoordinate) {
                    AppLogging.log('Delete xyz coordinate: [' + xyzCoordinate.x + ',' + xyzCoordinate.y + ',' + xyzCoordinate.z + ']');
                    area.maps.forEach(function (map) {
                        if (existsInOtherOfflineMap(map, xyzCoordinate, otherAreas)) {
                            AppLogging.log('Map exists in other offline area, skipping');
                            callbackSkip();
                        } else {
                            var tile = Map.getTileByName(map);
                            if (!tile) {
                                AppLogging.log('tile ' + map + ' not found');
                                reject('tile ' + map + ' not found');
                            }
                            var filename = AppSettings.mapFolder + '/' + tile.getMapFilename(xyzCoordinate.x, xyzCoordinate.y, xyzCoordinate.z);
                            AppLogging.log('Deleting file:' + filename);
                            PresistentStorage.removeFile(filename).then(callbackSuccess, callbackError);
                        }
                    });
                });
            });
        };

        var downloadAndStoreTile = function (tile, x, y, z, successCallback, errorCallback, cancel) {
            var sourceurl = tile._url_online.replace('{z}', z).replace('{x}', x).replace('{y}', y);
            var filename = AppSettings.mapFolder + '/' + tile.getMapFilename(x, y, z);
            AppLogging.log("Download " + sourceurl + " => " + filename);

            if (tile.options.subdomains) {
                var idx = Math.floor(Math.random() * tile.options.subdomains.length);
                var dom = tile.options.subdomains[idx];
                sourceurl = sourceurl.replace('{s}', dom);
            }
            PresistentStorage.downloadUrl(sourceurl, filename, cancel).then(successCallback, errorCallback);
        };

        var downloadXyzList = function (tile, xyzlist, completeXyzList, overwrite, progressCallback, completeCallback, errorCallback, cancelCallback, cancelPromise) {
            var cancel = false;
            if (cancelPromise) {
                cancelPromise.promise.then(function () {
                    cancel = true;
                });
            }

            function runThisOneByIndex(xyzs, index, cbprog, cbdone, cberr) {
                var x = xyzs[index].x;
                var y = xyzs[index].y;
                var z = xyzs[index].z;

                // thanks to closures this function would call downloadAndStoreTile() for this XYZ, then do the callbacks and all...
                // all we need to do is call it below, depending on the overwrite outcome
                function doneWithIt() {
                    // the download was skipped and not an error, so call the progress callback; then either move on to the next one, or else call our success callback
                    if (cbprog) cbprog(tile, { x: x, y: y, z: z });
                    continueOnNext();
                };

                function continueOnNext() {
                    if (index + 1 < xyzs.length) {
                        runThisOneByIndex(xyzs, index + 1, cbprog, cbdone, cberr);
                    } else {
                        if (cbdone) cbdone();
                    }
                };

                function yesReally() {
                    try {
                        downloadAndStoreTile(tile, x, y, z, doneWithIt,
                            function (errmsg) {
                                // an error in downloading
                                if (cberr) cberr(errmsg);
                                doneWithIt();
                            },
                            cancelPromise
                        );
                    } catch (error) {
                        if (cberr) cberr(error.message);
                        doneWithIt();
                    }
                }
                if (cancel) {
                    if (cancelCallback) cancelCallback();
                } else {
                    var filename = tile.getMapFilename(x, y, z);
                    if (completeXyzList.filter(function (item) { return item === filename }).length > 0) {
                        continueOnNext(); //this tile has allready been downloaded, skip
                    } else {
                        if (overwrite) {
                            AppLogging.log("Tile " + z + '/' + x + '/' + y + " -- " + "Overwrite=true so proceeding.");
                            yesReally();
                        } else {
                            try {

                                PresistentStorage.checkIfFileExsists(AppSettings.mapFolder + '/' + filename)
                                    .then(function () {
                                        AppLogging.log(filename + " exists. Skipping.");
                                        doneWithIt();
                                    },
                                        function () {
                                            AppLogging.log(filename + " missing. Fetching.");
                                            yesReally();
                                        });
                            } catch (error) {
                                if (cberr) cberr(error.message);
                                doneWithIt();
                            }
                        }
                    }
                }
            }
            runThisOneByIndex(xyzlist, 0, progressCallback, completeCallback, errorCallback);
        };

        /**
         * Check if any uncomplete downloads, and continue download
         * @returns {} 
         */
        service.checkUncompleteDownloads = function () {
            service.getUncompletedDownloads().then(function (uncomplete) {
                if (uncomplete.length > 0) {
                    var downloadMap = function (onProgress, cancel) {
                        return service.downloadArea(uncomplete[0],
                            onProgress,
                            cancel);
                    };

                    RegobsPopup.downloadProgress($translate.instant('UPDATE_OFFLINE_MAP'),
                        downloadMap,
                    { closeOnComplete: false });
                }
            });
        };

        /**
         * Check if any maps is not completed downloaded
         * @returns {} 
         */
        service.getUncompletedDownloads = function () {
            return service.getOfflineAreas().then(function (result) {
                return result.filter(function (item) { return !item.cancelled && item.complete.length  < item.tiles });
            });
        };

        /**
         * Download map area
         * @param {} area 
         * @param {} progressCallback 
         * @param {} cancelCallback 
         * @returns {} 
         */
        service.downloadArea = function (area, progressCallback, cancelCallback) {
            return $q(function (resolve) {
                var progress = new RegObs.ProggressStatus();
                var mapsComplete = [];
                var total = area.tiles;
                progress.setTotal(total);
                progress.setComplete(area.complete.length);
                progress.setErrors(area.errors);

                var updateAreaFromProgress = function () {
                    area.errors = progress.getErrors();
                    area.hasError = progress.hasError();
                };

                var progressFunc = function () {
                    updateAreaFromProgress();
                    service.saveOfflineAreas(meta).then(function () {
                        progressCallback(progress);
                    });
                };

                var doneFunc = function (map) {
                    mapsComplete.push(map);
                    if (mapsComplete.length === area.maps.length) {
                        updateAreaFromProgress();
                        service.saveOfflineAreas(meta)
                            .then(function () {
                                if (progress.isDone()) {
                                    service.getDiskUsageForXyzList(area.maps,
                                        area.xyzList,
                                        function (files, bytes) {
                                            area.size = bytes;
                                            area.tiles = total - progress.getErrors().length;
                                            if (files !== area.tiles) {
                                                AppLogging
                                                    .warn('Tiles downloaded ' +
                                                        area.tiles +
                                                        ' but files from disk usage is ' +
                                                        files);
                                            }
                                            service.saveOfflineAreas(meta).then(resolve);
                                        });
                                }
                            });
                    }
                };

                PresistentStorage.createDirectory(AppSettings.mapFolder)
                    .then(function () {
                        area.maps.forEach(function (item) {
                            var tile = Map.getTileByName(item);
                            downloadXyzList(tile,
                                area.xyzList,
                                area.complete,
                                false,
                                function onProgress(tile, xyz) {
                                    var filename = tile.getMapFilename(xyz.x, xyz.y, xyz.z);
                                    if (!progress.isCancelled()) {
                                        area.complete.push(filename);
                                    }
                                    progress.addComplete();
                                    progressFunc();
                                },
                                function onComplete() {
                                    doneFunc(item);
                                },
                                function onError(error) {
                                    progress.addError(error);
                                    AppLogging.warn('Could not download map tile: ' + JSON.stringify(error));
                                },
                                function onCancel() {
                                    area.cancelled = true;
                                    progress.setCancelled(true);
                                    doneFunc(item);
                                },
                                cancelCallback);
                        });
                    });
            });
        };


        service.downloadMapFromXyzList = function (name, bounds, xyzList, zoomMin, zoomMax, mapsArray, progressCallback, cancelCallback) {
            var downloadMapFromXyzListInternal = function () {
                if (!zoomMin)
                    throw Error('zoomMin must be set');
                if (!zoomMax)
                    throw Error('zoomMax must be set');
                if (!mapsArray || mapsArray.length <= 0)
                    throw Error('Maps array must be an array of map names');
                if (!xyzList)
                    throw Error('Xyz list must be set!');

                var boundingBox = [
                    [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
                    [bounds.getNorthEast().lat, bounds.getNorthEast().lng]
                ];

                var area = {
                    name: name,
                    size: 0,
                    bounds: boundingBox,
                    tiles: xyzList.length * mapsArray.length,
                    maps: mapsArray,
                    xyzList: xyzList,
                    zoom: zoomMax,
                    cancelled: false,
                    complete: [],
                    errors: []
                };
                meta.push(area);
                return service.saveOfflineAreas(meta)
                    .then(function () {
                        return service.downloadArea(area, progressCallback, cancelCallback);
                    });
            };

            return service.getOfflineAreas().then(downloadMapFromXyzListInternal);
        };

        service.downloadMapFromBounds = function (name, bounds, zoomMin, zoomMax, mapsArray, progressCallback, cancelCallback) {
            var xyzList = Map.calculateXYZListFromBounds(bounds, zoomMin, zoomMax);
            return service.downloadMapFromXyzList(name, bounds, xyzList,
                zoomMin,
                zoomMax,
                mapsArray,
                progressCallback,
                cancelCallback);
        };

        service.getFileName = function (map, x, y, z) {
            return [map, z, x, y].join('-') + '.png';
        };

        service.getFilesFromXyzList = function (maps, xyzList) {
            var files = [];
            xyzList.forEach(function (coord) {
                maps.forEach(function (map) {
                    files.push(service.getFileName(map, coord.x, coord.y, coord.z));
                });
            });
            return files;
        };

        service.getDiskUsageForXyzList = function (maps, xyzList, callback) {
            var fileNames = service.getFilesFromXyzList(maps, xyzList);
            AppLogging.log('Filenames to find: ' + JSON.stringify(fileNames));
            var found = [];
            var notFound = [];
            var bytes = 0;

            var checkCallback = function () {
                if ((found.length + notFound.length) === fileNames.length) {
                    if (callback) {
                        callback(found.length, bytes);
                    }
                    return;
                }
            };

            fileNames.forEach(function (file) {
                var relativePath = AppSettings.mapFolder + '/' + file;
                PresistentStorage.getFileSize(relativePath)
                    .then(function (result) {
                        AppLogging.log('file: ' + relativePath + ' is ' +result +' bytes');
                        bytes += result;
                        found.push(file);
                        checkCallback();
                    })
                    .catch(function (error) {
                        AppLogging.log('file not found: ' + relativePath +'. 0 bytes returned');
                        notFound.push({ name: file, error: error });
                        checkCallback();
                    });
            });
        };

        return service;
    });