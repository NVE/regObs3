angular
    .module('RegObs')
    .factory('Translate', function Translate($translate, $q) {
        var service = this;

        /**
         * Try to translate key with fallback on error
         * @param {} key 
         * @param {} fallback 
         * @returns {} 
         */
        service.translateWithFallback = function (key, fallback) {
            return $q(function (resolve) {
                $translate(key)
                    .then(function (result) {
                        resolve(result);
                    })
                    .catch(function () {
                        if (fallback) {
                            resolve(fallback);
                        } else {
                            resolve(key);
                        }
                    });
            });
        };

        return service;

    });