/**
 * Service to help writing files to persistant storage. When running in Ripple emulator, files will not be stored.
 */
angular.module('RegObs').factory('PresistentStorage', function (AppSettings, $cordovaFile, Utility, $q, AppLogging, LocalStorage, $cordovaDevice, $http, $window) {
    var service = this;

    /**
     * Helper method to create directory. Checks if directory exists first.
     * It is exposed public so it's possible to write unit tests and mock this method.
     * @param {} directory 
     * @returns {} promise
     */
    service._createDir = function (directory) {
        return $cordovaFile.checkDir(cordova.file.dataDirectory, directory)
            .catch(function () {
                AppLogging.log('directory ' + directory + ' not found, creating');
                return $cordovaFile.createDir(cordova.file.dataDirectory, directory, false);
            });
    };

    /**
     * Helper method to create directories recursively
     * @param {} directory full path. Example files/mydirectory/subdirectory
     * @returns {} promise
     */
    service._createDirRecursively = function (directory) {
        return $q(function (resolve) {
            var directories = directory.split('/');
            var i = 0;
            var createDirFragment = function () {
                var progress = function () {
                    AppLogging.log('Directory created');
                    i++;
                    createDirFragment();
                };

                if (i < directories.length) {
                    var dir = directories[0];
                    for (var j = 1; j <= i; j++) {
                        dir += '/' + directories[j];
                    }
                    AppLogging.log('Checking directory ' + dir);
                    service._createDir(dir)
                        .then(progress)
                        .catch(function (error) {
                            AppLogging.error('Could not create directory ' + dir + '. Returning. Error: ' + JSON.stringify(error));
                            resolve();
                        });
                } else {
                    resolve();
                }
            };

            createDirFragment();
        });
    };



    /**
     * Helper method to write file to storage using cordovaFile plugin. Creates directory first if not exist.
     * @param {} path 
     * @param {} filename 
     * @param {} content 
     * @returns {} 
     */
    service._writeFile = function (path, content) {
        var writeFile = function () {
            AppLogging.log('writing file: ' + cordova.file.dataDirectory + path);
            return $cordovaFile.writeFile(cordova.file.dataDirectory, path, content, true);
        };
        if (path.indexOf('/') > 0) {
            var directory = path.substr(0, path.lastIndexOf('/'));
            AppLogging.log('Creating directories: ' + directory);
            return service._createDirRecursively(directory).then(writeFile);
        } else {
            return writeFile();
        }
    };

    service._emulateCreateDirRecursively = function (path) {
        return $q(function (resolve) {
            resolve();
        });
    };

    /**
     * Emulate write file to presistant storage when running Ripple emulator
     * @param {} directory 
     * @param {} filename 
     * @param {} content 
     * @returns {} promise
     */
    service._emulateWriteFile = function (path, content, fallbackUrl) {
        return $q(function (resolve) {
            var strContent = content;
            if (fallbackUrl) {
                strContent = fallbackUrl; //Use fallback to url instead of actually storing
            }
            LocalStorage.set(path, strContent);

            resolve();
        });
    };

    /**
     * Get file content as text from emulated storage (LocalStorage)
     * @param {} path 
     * @returns {} 
     */
    service._emulateReadFileAsText = function (path) {
        return $q(function (resolve, reject) {
            var storedValue = LocalStorage.get(path, null);
            if (storedValue !== null) {
                resolve(storedValue);
            } else {
                reject({ code: 1, message: 'File not found' });
            }
        });
    };

    service._emulateGetUri = function (path) {
        return LocalStorage.get(path, null);
    };

    /**
     * Check if file exists in emulated storage
     * @param {} path 
     * @returns {} 
     */
    service._emulateCheckIfFileExists = function (path) {
        return $q(function (resolve, reject) {
            var storedValue = LocalStorage.get(path, null);
            if (storedValue !== null) {
                resolve();
            } else {
                reject({ code: 1, message: 'File not found' });
            }
        });
    };

    service._removeRecursively = function (folder) {
        return $q(function (resolve) {
            var keys = LocalStorage.getKeys();
            keys.forEach(function (key) {
                if (key.indexOf(folder) >= 0) {
                    LocalStorage.remove(key);
                }
            });
            resolve();
        });
    };

    service._emulateRemove = function (path) {
        return $q(function (resolve) {
            LocalStorage.remove(path);
            resolve();
        });
    };

    /**
     * Emulate free disk space
     * @returns {} 
     */
    service._emulateGetFreeDiskSpace = function () {
        return $q(function (resolve) {
            var max = 100 * 1024 * 1024; //100MB
            var min = 1 * 1024 * 1024; //1MB
            var randomnumber = Math.floor(Math.random() * (max - min + 1)) + min;
            resolve(randomnumber);
        });
    };

    /**
     * Emulate get file size
     * @param {} path 
     * @returns {} 
     */
    service._emulateGetFileSize = function (path) {
        return $q(function (resolve) {
            var max = 100 * 1024 * 1024; //100MB
            var min = 1; //1MB
            var randomnumber = Math.floor(Math.random() * (max - min + 1)) + min;
            resolve(randomnumber);
        });
    };

    /**
     * Store file to presistant storage
     * @param {} directory 
     * @param {} filename 
     * @param {} content 
     * @returns {} 
     */
    service.storeFile = function (path, content, fallbackUrl) {
        if (Utility.isRippleEmulator()) {
            return service._emulateWriteFile(path, content, fallbackUrl);
        } else {
            return service._writeFile(path, content);
        }
    };


    /**
     * Read stored content as text
     * @param {} fullpath 
     * @returns {} 
     */
    service.readAsText = function (path) {
        if (Utility.isRippleEmulator()) {
            return service._emulateReadFileAsText(path);
        } else {
            return $cordovaFile.readAsText(cordova.file.dataDirectory, path);
        }
    };

    /**
     * Check if file exists in presistant storage
     * @param {} path 
     * @returns {} promise
     */
    service.checkIfFileExsists = function (path) {
        if (Utility.isRippleEmulator()) {
            return service._emulateCheckIfFileExists(path);
        } else {
            return $cordovaFile.checkFile(cordova.file.dataDirectory, path);
        }
    };

    /**
     * Get presistant storage file url
     * @param {} path 
     * @returns {} 
     */
    service.getUri = function (path) {
        if (Utility.isRippleEmulator()) {
            return service._emulateGetUri(path);
        } else {
            return cordova.file.dataDirectory + path;
        }
    };

    service.removeRecursively = function (folder) {
        if (Utility.isRippleEmulator()) {
            return service._removeRecursively(folder);
        } else {
            return $cordovaFile.removeRecursively(cordova.file.dataDirectory, folder);
        }
    };

    service.removeFile = function (path) {
        if (Utility.isRippleEmulator()) {
            return service._emulateRemove(path);
        } else {
            return $cordovaFile.removeFile(cordova.file.dataDirectory, path);
        }
    };

    /**
     * Get available free diskspace
     * @returns {} 
     */
    service.getFreeDiskSpace = function () {
        if (Utility.isRippleEmulator()) {
            return service._emulateGetFreeDiskSpace();
        } else {
            return $cordovaFile.getFreeDiskSpace()
                .then(function (success) {
                    var ios = $cordovaDevice.getDevice() && $cordovaDevice.getDevice().platform === 'iOS';
                    return success * (ios ? 1 : 1000);
                    //ios returns result in bytes, and android in kB                             
                });
        }
    };

    /**
     * Get filesize
     * @param {} path 
     * @returns {} file size in bytes
     */
    service.getFileSize = function (path) {
        if (Utility.isRippleEmulator()) {
            return service._emulateGetFileSize(path);
        } else {
            return $q(function (resolve, reject) {
                $window.resolveLocalFileSystemURL(cordova.file.dataDirectory + path,
                    function (fileEntry) {
                        fileEntry.file(function (fileInfo) {
                            resolve(fileInfo.size);
                        },
                            reject);
                    },
                    reject);
            });
        }
    };

    /**
     * Download url and store to file
     * @param {} url 
     * @param {} path 
     * @returns {} 
     */
    service.downloadUrl = function (url, path, cancel) {
        if (Utility.isRippleEmulator()) {
            return service.storeFile(path, null, url);
        } else {
            //var options = { responseType: 'arraybuffer' };
            //if (cancel) {
            //    options.timeout = cancel.promise;
            //}

            //return $http.get(url, options)
            //     .then(function (data) {
            //         var utf8Str = new Uint8Array(data); // Convert to UTF-8...
            //         var binaryArr = utf8Str.buffer; // Convert to buffer...
            //         return service.storeFile(path, binaryArr);
            //     });
            return $q(function (resolve, reject) {
                var transfer = new FileTransfer();
                var filename = cordova.file.dataDirectory + path;
                transfer.download(
                    url,
                    filename,
                    function (file) {
                        // tile downloaded OK; set the iOS "don't back up" flag then move on
                        file.setMetadata(null, null, { "com.apple.MobileBackup": 1 });
                        resolve();
                    },
                    function (error) {
                        var errmsg = '';
                        switch (error.code) {
                            case FileTransferError.FILE_NOT_FOUND_ERR:
                                errmsg = "Not found: " + url;
                                break;
                            case FileTransferError.INVALID_URL_ERR:
                                errmsg = "Invalid URL:" + url;
                                break;
                            case FileTransferError.CONNECTION_ERR:
                                errmsg = "Connection error at the web server.\n";
                                break;
                        }
                        reject(errmsg);
                    }
                );
                if (cancel) {
                    cancel.promise.then(function () {
                        transfer.abort();
                    });
                }
            });
        }
    };

    /**
     * Create directory
     * @param {} path 
     * @returns {} 
     */
    service.createDirectory = function (path) {
        if (Utility.isRippleEmulator()) {
            return service._emulateCreateDirRecursively(path);
        } else {
            return service._createDirRecursively(path);
        }
    };

    return service;
});