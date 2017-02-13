/**
 * Class for Observation object
 */
angular.module('RegObs').factory('Observation', function (MapSelectableItem, AppSettings, PresistentStorage, UserLocation, DateHelpers, moment, RegObsObservationTypeFactory) {

    /**
     * Constructor for Observation
     * @param {} json 
     * @returns {} 
     */
    var Observation = function (json) {
        if (!json || typeof json !== 'object' || !json.RegId) {
            throw new Error('Could not create Observation. Invalid json!');
        }

        angular.merge(this, json);
        this._images = [];
        this._registrations = [];

        this.init();
    };



    /**
     * Static helper method
     * @param {} item 
     * @returns {} 
     */
    Observation.getObsDescription = function (item) {
        var result = [];
        if (item.TypicalValue2) {
            result.push(item.TypicalValue2);
        }
        if (item.TypicalValue1) {
            result.push(item.TypicalValue1);
        }
        return result;
    };

    


    /**
     * Load json data to initialize object
     * @param {} json 
     * @returns {} 
     */
    Observation.prototype.init = function () {
        var self = this;
        self._images = [];
        self._registrations = [];
        if (self.Registrations) {
            self.Registrations.forEach(function (item) {
                var observationType = RegObsObservationTypeFactory.getObservationTypeInstance(item);
                self._registrations.push(observationType);
            });
        }
        if (self.Pictures) {
            self.Pictures.forEach(function (item) {
                var pictureId = item.TypicalValue2;
                var path = AppSettings.getImageRelativePath(pictureId);
                var uri = PresistentStorage.getUri(path);
                self._images.push({ id: pictureId, url: uri, description: item.TypicalValue1 });
            });
        }
    };

    /**
     * Get location name or municipal name
     * @returns {} 
     */
    Observation.prototype.getBestLocationName = function () {
        return this.LocationName || this.MunicipalName || '';
    };

    /**
     * Get observation types description. For example Faretegn,Skredfarevudering,Ullykke/Hendelse
     * @returns {} 
     */
    Observation.prototype.getObservationTypeDescription = function () {
        var arr = [];
        this._registrations.forEach(function (item) {
            var name = item.getName();
            if (arr.indexOf(name) < 0) { //Do not add duplicated values
                arr.push(name);
            }
        });
        return arr.join(', ');
    };

    /**
     * Does observation contain any images?
     * @returns {} 
     */
    Observation.prototype.hasImages = function () {
        return this._images.length > 0;
    };

    /**
     * Get first image
     * @returns {} 
     */
    Observation.prototype.getFirstImage = function () {
        return this._images[0];
    };

    /**
     * Get all registrations for this observation
     * @returns {} 
     */
    Observation.prototype.getRegistrations = function () {
        return this._registrations;
    };

    /**
     * Registration count
     * @returns {} 
     */
    Observation.prototype.getRegistrationCount = function () {
        return this._registrations.length;
    };

    /**
     * Get image count
     * @returns {} 
     */
    Observation.prototype.getImageCount = function () {
        return this._images.length;
    };

    /**
     * Get images
     * @returns {} 
     */
    Observation.prototype.getImages = function () {
        return this._images;
    };

    /**
     * Get competnece level
     * @returns {} 
     */
    Observation.prototype.getObservationCompetenceLevel = function() {
        return this.CompetenceLevelName && this.CompetenceLevelName !== 'Ukjent' ? this.CompetenceLevelName : '';
    };


    Observation.prototype.getUserDistance = function () {
        return UserLocation.getUserDistanceFrom(this.Latitude, this.Longitude);
    };

    Observation.prototype.getUserDistanceText = function () {
        var distance = UserLocation.getUserDistanceFrom(this.Latitude, this.Longitude);
        if (distance.valid) {
            return distance.description;
        }
        return '';
    };

    /**
     * Get days until expiery of this observation. For example if days back is 3 days, the observation expires 3 days back from now
     * @returns {} 
     */
    Observation.prototype.getDaysUntilExpiery = function () {
        var date = moment(this.DtObsTime, moment.ISO_8601); //strict parsing
        var fromNow = DateHelpers.now().diff(date, 'days');
        return AppSettings.getObservationsDaysBack() - fromNow;
    };

    /**
     * Factory for creating new Observation from json
     * @param {} json 
     * @returns {} 
     */
    Observation.fromJson = function (json) {
        return new Observation(json);
    };


    return Observation;
});