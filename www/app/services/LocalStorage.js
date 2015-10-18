/**
 * Created by storskel on 11.06.2015.
 */
angular
    .module('RegObs')
    .factory('LocalStorage', function LocalStorage($window) {
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
                $window.localStorage.setItem(key, JSON.stringify(value));
            },
            getObject: function (key, defaultValue) {
                console.log('Fetching from local storage');
                var fetched = $window.localStorage.getItem(key);
                return fetched? JSON.parse(fetched) : defaultValue;
            }
        }
    });