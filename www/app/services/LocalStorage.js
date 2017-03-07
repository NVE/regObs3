/**
 * Created by storskel on 11.06.2015.
 */
angular
    .module('RegObs')
    .factory('LocalStorage', ['$window', function($window) {
        return {
            set: function (key, value) {
                $window.localStorage.setItem(key, value);
                return value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage.getItem(key) || defaultValue;
            },
            getAndSetObject: function(key, idToCheck, defaultValue){
                var fetched = this.getObject(key, defaultValue);
                return fetched && fetched[idToCheck] ? fetched : defaultValue;
            },
            setObject: function (key, value) {
                $window.localStorage.setItem(key, angular.toJson(value));
            },
            getObject: function (key, defaultValue) {
                var fetched = $window.localStorage.getItem(key);
                return fetched && fetched !== 'undefined'? angular.fromJson(fetched) : defaultValue;
            },
            getAndMergeObject: function (key, defaultValue) {           
                var fetched = $window.localStorage.getItem(key);
                if (fetched && fetched !== 'undefined') {
                    var obj = angular.fromJson(fetched);
                    var defaults = angular.copy(defaultValue);
                    angular.merge(defaults, obj);
                    return defaults;
                } else {
                    return defaultValue;
                }
            },
            remove: function(key) {
                $window.localStorage.removeItem(key);
            },
            clear: function(){
                $window.localStorage.clear();
            },
            getKeys: function() {
                var keys = [];
                for (var key in $window.localStorage) {
                    keys.push(key);
                }
                return keys;
            }
        }
    }]);