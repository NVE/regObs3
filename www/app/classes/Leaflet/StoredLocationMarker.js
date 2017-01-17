angular.module('RegObs').factory('StoredLocationMarker', function (MapSelectableItem, $translate, Utility, ObsLocation, Registration) {

    /**
     * Stored location marker
     * @param {}  
     * @returns {} 
     */
    var StoredLocationMarker = MapSelectableItem.extend({

        options: {
            typeDescription: $translate.instant('PREVIOUS_USED_PLACE')
        },

        _getObservationPinHtml: function (selected) {
            var geoHazardType = Utility.getGeoHazardType(this.storedLocation.geoHazardId);
            return '<div class="observation-pin ' + (selected ? 'selected ' : '') + geoHazardType + '"><i class="icon ion-pin observation-pin-icon"></i></div>';
        },

        _getIcon: function (selected) {
            var self = this;
            return L.divIcon({
                className: 'my-div',
                html: self._getObservationPinHtml(selected)
            });
        },

        initialize: function (storedLocation, options) {
            var self = this;
            L.Util.setOptions(this, options);
            var latlng = new L.LatLng(storedLocation.LatLngObject.Latitude, storedLocation.LatLngObject.Longitude);
            this.storedLocation = storedLocation;
            this.options.selectedIcon = this._getIcon(true);
            this.options.unselectedIcon = this._getIcon(false);
            this.options.icon = this._getIcon(false);
            this.options.actionButtons[1].onClick = function () {
                ObsLocation.setPreviousUsedPlace(self.storedLocation.LocationId,
                    self.storedLocation.Name,
                    {
                        Latitude: self.storedLocation.LatLngObject.Latitude,
                        Longitude: self.storedLocation.LatLngObject.Longitude,
                        Uncertainty: 0,
                        UTMSourceTID: ObsLocation.source.storedPosition
                    });
                Registration.createAndGoToNewRegistration();
            };

            // call super
            MapSelectableItem.prototype.initialize.call(this, latlng, this.options);
        },

        getHeader: function () {
            if (this.storedLocation) {
                return this.storedLocation.Name;
            } else {
                return MapSelectableItem.prototype.getHeader.call(this);
            }
        }
    });

    return StoredLocationMarker;
});