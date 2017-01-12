angular.module('RegObs').factory('StoredLocationMarker', function (MapSelectableItem, $translate, Utility) {

    /**
     * Stored location marker
     * @param {}  
     * @returns {} 
     */
    var StoredLocationMarker = MapSelectableItem.extend({

        options: {
            typeDescription: $translate.instant('STORED_LOCATION')
        },

        _getIcon: function (selected) {
            var geoHazardType = Utility.getGeoHazardType(this.storedLocation.geoHazardId);
            return L.divIcon({
                className: 'nearby-location-marker',
                html: '<div class="nearby-location-marker ' +
                    (selected ? 'selected ' : '') +
                    geoHazardType +
                    '"><div class="nearby-location-marker-inner"></div></div>'
            });
        },

        initialize: function (storedLocation, options) {
            L.Util.setOptions(this, options);
            var latlng = new L.LatLng(storedLocation.LatLngObject.Latitude, storedLocation.LatLngObject.Longitude);
            this.storedLocation = storedLocation;
            this.options.selectedIcon = this._getIcon(true);
            this.options.unselectedIcon = this._getIcon(false);
            this.options.icon = this._getIcon(false);
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