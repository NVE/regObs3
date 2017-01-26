angular.module('RegObs').factory('CurrentObsLocationMarker', function (MapSelectableItem, Observation, $translate, Utility, $state, ObsLocation, Registration, AppSettings, Trip) {

    /**
     * Stored location marker
     * @param {}  
     * @returns {} 
     */
    var CurrentObsLocationMarker = MapSelectableItem.extend({
        options: {
            draggable: true,
            zIndexOffset: 1000,
            actionButtons: [
                {
                    extraClasses: 'regobs-button-tour',
                    buttonColor: '#fff',
                    iconColor: '#444',
                    icon: 'ion-android-walk',
                    isVisible: function () {
                        return AppSettings.getAppMode() === 'snow';
                    },
                    onClick: function () {
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
                    onClick: Registration.createAndGoToNewRegistration,
                    isVisible: Registration.isEmpty
                },
                {
                    extraClasses: 'regobs-button-add',
                    buttonColor: '#fff',
                    iconColor: '#444',
                    icon: 'ion-edit',
                    onClick: Registration.createAndGoToNewRegistration,
                    isVisible: function () { return !Registration.isEmpty() }
                },
                {
                    extraClasses: 'regobs-button-delete',
                    buttonColor: '#D21523',
                    iconColor: '#fff',
                    icon: 'ion-close',
                    isVisible: ObsLocation.isSet
                }]
        },

        _getIcon: function (isSet) {
            //return L.AwesomeMarkers.icon({
            //    icon: isSet ? 'ion-flag' : 'arrow-move',
            //    prefix: 'ion',
            //    markerColor: isSet ? 'gray' : 'green',
            //    extraClasses: 'map-obs-marker' + (isSet ? ' map-obs-marker-set' : '')
            //});
            if (isSet) {
                return this._iconSet;
            } else {
                return this._iconDrag;
            }
        },
        _iconSet: L.AwesomeMarkers.icon({
            icon: 'ion-flag',
            prefix: 'ion',
            markerColor: 'gray',
            extraClasses: 'map-obs-marker map-obs-marker-set'
        }),
        _iconDrag: L.AwesomeMarkers.icon({
            icon: 'arrow-move',
            prefix: 'ion',
            markerColor: 'green',
            extraClasses: 'map-obs-marker'
        }),

        initialize: function (latlng, options) {
            var self = this;
            L.Util.setOptions(self, options);
            this.options.icon = this._getIcon(ObsLocation.isSet());

            this.options.actionButtons[3].onClick = function () {
                self.clear();
            };

            // call super
            MapSelectableItem.prototype.initialize.call(self, latlng, self.options);
            self.on('dragstart', function () {
                self.isDragging = true;
            });
            self.on('dragend', function () {
                self.isDragging = false;
                self._setCurrentPositionAsObsLocation();
            });
            self.refresh();
        },

        clear: function () {
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

        _isObsLocStoredPosition: function () {
            var obsLoc = ObsLocation.get();
            return obsLoc.UTMSourceTID === ObsLocation.source.storedPosition;
        },

        setUserPosition: function (latlng) {
            var self = this;
            self.options.userPosition = latlng;
            if (!self.isDragging) {
                self.refresh();
            }
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

        _fireChange: function () {
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
            var icon = self._getIcon(ObsLocation.isSet());
            if (icon !== this.options.icon) {
                self.setIcon(icon);
            }
        },

        getHeader: function () {
            if (this._isObsLocSetManually()) {
                return '';
            } else if (this._isObsLocStoredPosition()) {
                return ObsLocation.get().Name;
            } else if (this.options.userPosition) {
                return $translate.instant('YOUR_GPS_POSITION');
            } else {
                return '';
            }
        },

        getDescription: function () {
            if (!ObsLocation.isSet()) {
                return $translate.instant('SET_POSITION_HELP_TEXT');
            }
            return '';
        },

        getTypeDescription: function () {
            if (this._isObsLocSetManually()) {
                return 'MARKED_POSITION';
            } else if (this._isObsLocStoredPosition()) {
                return 'PREVIOUS_USED_PLACE';
            }
            return '';
        }
    });

    return CurrentObsLocationMarker;
});