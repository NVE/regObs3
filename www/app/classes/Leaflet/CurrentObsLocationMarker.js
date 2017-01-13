angular.module('RegObs').factory('CurrentObsLocationMarker', function (MapSelectableItem, Observation, $translate, Utility, $state, ObsLocation) {

    /**
     * Stored location marker
     * @param {}  
     * @returns {} 
     */
    var CurrentObsLocationMarker = MapSelectableItem.extend({
        options: {
            draggable: true,
            zIndexOffset: 1000
        },

        _getIcon: function (isSet) {
            return L.AwesomeMarkers.icon({
                icon: isSet ? 'ion-flag' : 'arrow-move',
                prefix: 'ion',
                markerColor: isSet ? 'gray' : 'green',
                extraClasses: 'map-obs-marker' + (isSet ? ' map-obs-marker-set' : '')
            });
        },

        initialize: function (latlng, options) {
            var self = this;
            L.Util.setOptions(self, options);

            this.options.icon = this._getIcon(ObsLocation.isSet());

            self.options.actionButtonsOnNotSet = angular.copy(self.options.actionButtons);
            self.options.actionButtonsOnSet = angular.copy(self.options.actionButtons);
            self.options.actionButtonsOnSet.push({
                extraClasses: 'regobs-button-delete',
                buttonColor: '#D21523',
                iconColor: '#fff',
                icon: 'ion-close',
                onClick: function() {
                    self.clear();
                }
            });

            // call super
            MapSelectableItem.prototype.initialize.call(self, latlng, self.options);
            self.on('dragstart', function () {
                self.isDragging = true;
            });
            self.on('dragend', function () {
                self.isDragging = false;
                self._setCurrentPositionAsObsLocation();
            });
            self.on('drag', self._fireChange);

            self.refresh();
        },

        clear: function() {
            ObsLocation.remove();
            this.refresh();
            this.fire('obsLocationCleared');
        },

        _setCurrentPositionAsObsLocation: function () {
            this.setObsLocationManually(this.getLatLng());
        },

        _isObsLocSetManually: function () {
            var obsLoc = ObsLocation.get();
            return obsLoc.UTMSourceTID === ObsLocation.source.clickedInMap;
        },

        setUserPosition: function (latlng) {
            this.options.userPosition = latlng;
            this.refresh();
        },

        setObsLocationManually: function (latlng) {
            var obsLoc = {
                Latitude: latlng.lat.toString(),
                Longitude: latlng.lng.toString(),
                Uncertainty: '0',
                UTMSourceTID: ObsLocation.source.clickedInMap
            };
            ObsLocation.set(obsLoc);
            this._setLatLng(new L.LatLng(obsLoc.Latitude, obsLoc.Longitude));
            this.setSelected();
            this.refresh();
        },

        _fireChange: function() {
            this.fire('obsLocationChange', this.getLatLng());
        },

        _setLatLng: function (latlng) {
            this.setLatLng(latlng).update();
            this._fireChange();
        },

        refresh: function () {
            var self = this;
            if (!self.isDragging) {
                var newLatLng = null;
                var currentLatLng = self.getLatLng();
                if (ObsLocation.isSet()) {
                    var obsLoc = ObsLocation.get();
                    newLatLng = new L.LatLng(obsLoc.Latitude, obsLoc.Longitude);
                } else if (self.options.userPosition) {
                    newLatLng = self.options.userPosition;
                }
                if (newLatLng && (!newLatLng.equals(currentLatLng))) {
                    self._setLatLng(newLatLng);
                }
            }
            self.setIcon(self._getIcon(ObsLocation.isSet()));
            
            if (self.options.isSelected) {
                if (ObsLocation.isSet()) {
                    self.options.actionButtons = self.options.actionButtonsOnSet;
                } else {
                    self.options.actionButtons = self.options.actionButtonsOnNotSet;
                }
            }
        },

        getHeader: function () {
            if (this._isObsLocSetManually()) {
                return '';
            } else if (this.options.userPosition) {
                return $translate.instant('YOUR_GPS_POSITION');
            } else {
                return '';
            }
        },

        getDescription: function () {
            if (this._isObsLocSetManually()) {
                return $translate.instant('MARKED_POSITION');
            } else {
                return $translate.instant('SET_POSITION_HELP_TEXT');
            }
        },

        getTypeDescription: function () {
            return '';
        }
    });

    return CurrentObsLocationMarker;
});