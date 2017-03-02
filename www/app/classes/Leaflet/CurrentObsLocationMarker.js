angular.module('RegObs').factory('CurrentObsLocationMarker', function (MapSelectableItem, Observation, $translate, Utility, $state, ObsLocation, Registration, AppSettings, Trip, User) {

    /**
     * Stored location marker
     * @param {}  
     * @returns {} 
     */
    var CurrentObsLocationMarker = MapSelectableItem.extend({
        options: {
            draggable: false,
            zIndexOffset: 1000,
            actionButtons: [
                {
                    extraClasses: 'regobs-button-tour',
                    buttonColor: '#fff',
                    iconColor: '#444',
                    icon: 'ion-android-walk',
                    isVisible: function () {
                        return Registration.isEmpty() && Trip.canStart();
                    },
                    onClick: function () {
                        $state.go('snowtrip');
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
                    isVisible: function () { return ObsLocation.isSet() && Registration.isEmpty() }
                }]
        },

        _getIcon: function (isSet) {
            if (isSet) {
                return new L.Icon.Default();
            } else {
                return this._iconDrag;
            }
        },
        //_iconSet: L.AwesomeMarkers.icon({
        //    icon: 'ion-flag',
        //    prefix: 'ion',
        //    markerColor: 'gray',
        //    extraClasses: 'map-obs-marker map-obs-marker-set'
        //}),
        _iconDrag: L.divIcon({ html: '', iconSize: L.point(1, 1) }),

        initialize: function (latlng, options) {
            var self = this;
            L.Util.setOptions(self, options);
            this.options.icon = this._getIcon(ObsLocation.isSet());

            this.options.actionButtons[3].onClick = function () {
                self.clear();
            };
            // call super
            MapSelectableItem.prototype.initialize.call(self, latlng, self.options);
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
            self.refresh();
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

            var icon = self._getIcon(ObsLocation.isSet());
            if (icon !== this.options.icon) {
                self.setIcon(icon);
            }
        },

        getHeader: function () {
            if (!Registration.isEmpty()) {
                return 'Pågående registrering';
            } else {
                if (this._isObsLocStoredPosition()) {
                    return ObsLocation.get().Name;
                }
                return '';
            }
        },

        getDescription: function () {
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