var RegObs = RegObs || {};
RegObs.MapSelectableItem = function() {
    var self = this;

    self.canStartTrip = true;
    self.canStartObservation = true;
    self.setViewOnSelect = true;

    self.header = '';
    self.description = '';
    self.distance = '';
    self.type = '';

    self.setPosition = function(latlng) {
        self._latlng = latlng;
    };

    self.getPosition = function() {
        return self._latlng;
    };

    self.hasImages = function () {
        return false;
    };

    self.getHeader = function() {
        return self.header;
    };

    self.setHeader = function (header) {
        self.header = header;
    };

    self.getDescription = function () {
        return self.description;
    };

    self.setDescription = function (description) {
        self.description = description;
    };

    self.getDistance = function () {
        return self.distance;
    };

    self.setDistance = function (distance) {
        self.distance = distance;
    };

    self.getType = function() {
        return self.type;
    }

    self.setType = function(type) {
        self.type = type;
    }
};