angular
    .module('RegObs')
    .factory('UserLocation', function (LocalStorage, Utility) {
        var key = 'LastUserLocation';
        var service = this;

        service.getLastUserLocation = function() {
            return LocalStorage.getObject(key);
        };

        service.setLastUserLocation = function(position)
        {
            return LocalStorage.setObject(key, { latitude:position.latitude, longitude: position.longitude, accuracy: position.accuracy, timestamp: position.timestamp });
        };

        service.hasUserLocation = function() {
            return service.getLastUserLocation() ? true : false;
        }

        service.getUserDistanceFrom = function (lat, lng) {
            var lastUserLoc = service.getLastUserLocation();
            var distance = {valid:false};
            if (lastUserLoc) {
                distance.distance = L.latLng(lat, lng).distanceTo(L.latLng(lastUserLoc.latitude, lastUserLoc.longitude));
                distance.description = Utility.getDistanceText(distance.distance);
                distance.valid = true;
            }
            return distance;
        };

        return service;
    });