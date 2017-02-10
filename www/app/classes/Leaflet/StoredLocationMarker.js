angular.module('RegObs').factory('StoredLocationMarker', function (MapSelectableItem, $translate, Utility, ObsLocation, Registration, AppSettings, Trip, $state, $rootScope) {

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
            self.storedLocation = storedLocation;
            var latlng = new L.LatLng(self.storedLocation.LatLngObject.Latitude, self.storedLocation.LatLngObject.Longitude);

            self.options.geoHazardId = storedLocation.geoHazardId;
            self.options.selectedIcon = self._getIcon(true);
            self.options.unselectedIcon = self._getIcon(false);
            self.options.icon = this._getIcon(false);

            self.options.actionButtons = [
                {
                    extraClasses: 'regobs-button-tour',
                    buttonColor: '#fff',
                    iconColor: '#444',
                    icon: 'ion-android-walk',
                    isVisible: function() {
                        return AppSettings.getAppMode() === 'snow';
                    },
                    onClick: function() {
                        if (Trip.model.started) {
                            Trip.stop();
                        } else {
                            $state.go('snowtrip');
                        }
                    }
                },
                {
                    extraClasses: 'regobs-button-add',
                    buttonColor: '#33cd5f',
                    iconColor: '#fff',
                    icon: 'ion-plus',
                    onClick: function() {
                        ObsLocation.setPreviousUsedPlace(self.storedLocation.LocationId,
                        self.storedLocation.Name,
                        {
                            Latitude: self.storedLocation.LatLngObject.Latitude.toString(),
                            Longitude: self.storedLocation.LatLngObject.Longitude.toString(),
                            Uncertainty: '0',
                            UTMSourceTID: ObsLocation.source.storedPosition
                        });
                        $rootScope.$broadcast('$regObs:nearbyLocationRegistration');
                        Registration.createAndGoToNewRegistration();
                    },
                    isVisible: function() {
                        return Registration.isEmpty();
                    }
                }
            ];

            // call super
            MapSelectableItem.prototype.initialize.call(this, latlng, self.options);
        },

        getHeader: function () {           
           return this.storedLocation.Name;         
        },

        getId: function () {
            return this.storedLocation.LocationId;
        },

        getStoredLocation: function() {
            return this.storedLocation;
        }
    });

    return StoredLocationMarker;
});