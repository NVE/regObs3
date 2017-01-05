/**
 * Helper class for observetaions
 */
var RegObs = RegObs || {};
RegObs.Observation = function(json, AppSettings) {
    var self = this;
   
    self._images = [];
    self._registrations = [];

    self.loadJson = function (json) {
        angular.merge(self, json);
        self._images = [];
        self._registrations = [];
        self.Registrations.forEach(function (reg) {
            reg.Registrations.forEach(function (item) {
                if (AppSettings.isObsImage(item.RegistrationTid)) {
                    var pictureId = item.TypicalValue2;
                    var url = AppSettings.getWebImageUrl(pictureId);
                    self._images.push(url);
                } else {
                    self._registrations.push(item);
                }
            });
        });
    };

    self.hasImages = function() {
        return self._images.length > 0;
    };

    self.getFirstImage = function() {
        return self._images[0];
    };

    self.getRegistrations = function() {
        return self._registrations;
    };

    self.shortDescriptionHtml = function() {
        return '<i class="icon ion-eye"></i> ' + self._registrations.length + ' &bull; ' + self.ObserverNick;
    };

    //Init
    self.loadJson(json);
};
RegObs.observationFromJson = function (json, AppSettings) {
    return new RegObs.Observation(json, AppSettings);
};