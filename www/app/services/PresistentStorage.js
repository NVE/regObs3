/**
 * Service to help writing files to persistant storage. When running in Ripple emulator, files will not be stored.
 */
angular.module('RegObs').factory('PresistentStorage', function (AppSettings, $cordovaFile, Utility, $q, AppLogging, LocalStorage) {
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
        return $q(function (resolve, reject) {
            var directories = directory.split('/');
            var i = 0;

            var createDirFragment = function () {
                if (i < directories.length) {
                    var dir = directories[0];
                    for (var j = 1; j <= i; j++) {
                        dir += '/' + directories[j];
                    }
                    AppLogging.log('Checking directory ' + dir);
                    service._createDir(dir)
                        .then(function () {
                            i++;
                            createDirFragment();
                        }).catch(reject);
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
            return $cordovaFile.writeFile(cordova.file.dataDirectory, path, content, true);
        };
        if (path.indexOf('/')>0) {
            var directory = path.substr(0, path.lastIndexOf('/'));
            return service._createDirRecursively(directory).then(writeFile);
        } else {
            return writeFile();
        }
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
                reject({ code: 0, message: 'File not found' });
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
                reject({ code: 0, message: 'File not found' });
            }
        });
    };

    service._emulateClear = function () {
        return $q(function(resolve) {
            LocalStorage.clear();
            resolve();
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

    service.clear = function () {
        if (Utility.isRippleEmulator()) {
            return service._emulateClear();
        } else {
            return $cordovaFile.removeRecursively(cordova.file.dataDirectory, '');
        }
    };

    return service;
});