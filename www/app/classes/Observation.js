/**
 * Class for Observation object
 */
angular.module('RegObs').factory('Observation', function (MapSelectableItem, AppSettings, PresistentStorage, $state) {

    /**
     * Constructor for Observation
     * @param {} json 
     * @returns {} 
     */
    var Observation = function (json) {
        angular.merge(this, json);
        this._images = [];
        this._registrations = [];

        this.init();
    };

    ///**
    // * On user click, navigate to observation details
    // * @returns {} 
    // */
    //Observation.prototype.onClick = function () {
    //    var self = this;
    //    $state.go('observationdetails', { observation: self });
    //};

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
     * Static helper method to check if registration is image
     * @param {} registration 
     * @returns {} 
     */
    Observation.isRegistrationImage = function(registration) {
        return AppSettings.isObsImage(registration.RegistrationTid);
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
            self.Registrations.forEach(function(item) {
                if (Observation.isRegistrationImage(item)) {
                    var pictureId = item.TypicalValue2;
                    var path = AppSettings.getImageRelativePath(pictureId);
                    var uri = PresistentStorage.getUri(path);
                    self._images.push({ id: pictureId, url: uri, description: item.TypicalValue1 });
                } else {
                    self._registrations.push({
                        name: (item.RegistrationName || '').trim(),
                        description: Observation.getObsDescription(item)
                    });
                }
            });
        }
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

    ///**
    // * Get header html
    // * @returns {} 
    // */
    //Observation.prototype.getHeader = function () {
    //    return '<i class="icon ion-eye"></i> ' + this._registrations.length + ' &bull; ' + this.NickName;
    //};

    ///**
    // * Get detscription html
    // * @returns {} 
    // */
    //Observation.prototype.getDescription = function () {
    //    return moment(this.DtObsTime).format('DD.MM, [kl.] HH:mm');
    //};

    ///**
    // * Get type of observation
    // * @returns {} 
    // */
    //Observation.prototype.getType = function () {
    //    return 'Snøobservasjon';
    //};

    /**
     * Factory for creating new Observation from json
     * @param {} json 
     * @returns {} 
     */
    Observation.fromJson = function(json) {
        return new Observation(json);
    };


    return Observation;
});