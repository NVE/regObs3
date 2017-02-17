angular.module('RegObs').factory('NewRegistrationMarker', function (MapSelectableItem, Utility, $state, Observation, Observations) {

    /**
     * Stored location marker
     * @param {}  
     * @returns {} 
     */
    var NewRegistrationMarker = MapSelectableItem.extend({
        options: {

        },

        _getObservationPinHtml: function (selected) {
            var geoHazardType = Utility.getGeoHazardType(this.registration.GeoHazardTID);
            return '<div class="observation-pin' +
                (selected ? ' selected ' : ' ') +
                geoHazardType +'"><i class="icon ion-eye observation-pin-icon ' + '"></i></div>';
        },

        _getIcon: function (selected) {
            var self = this;
            return L.divIcon({
                className: 'my-div',
                html: self._getObservationPinHtml(selected)
            });
        },
       
        initialize: function (registration, options) {
            L.Util.setOptions(this, options);
            var latlng = new L.LatLng(registration.ObsLocation.Latitude, registration.ObsLocation.Longitude);
            this.registration = registration;
            this.options.geoHazardId = registration.GeoHazardTID;
            this.options.selectedIcon = this._getIcon(true);
            this.options.unselectedIcon = this._getIcon(false);
            this.options.icon = this._getIcon(false);

            var self = this;
            self.options.actionButtons =
            [
                {
                    extraClasses: 'regobs-button-add',
                    buttonColor: '#fff',
                    iconColor: '#444',
                    icon: 'ion-eye',
                    onClick: function () {
                        self.onClick();
                    },
                    isVisible: function () {
                        return true;
                    }
                }
            ];

            // call super
            MapSelectableItem.prototype.initialize.call(this, latlng, this.options);
        },

        getId: function () {
            return this.registration.Id;
        },

        getHeader: function () {
            return 'Ny registrering';
        },

        getDescription: function() {
            if (self.loading) {
                return 'Laster...'
            } else {
                return '';
            }
        },

        onClick: function () {
            var self = this;
            var latLng = self.getLatLng();
            self.loading = true;
            Observations.updateObservationsWithinRadius(latLng.lat,
                    latLng.lng,
                    10,
                    self.options.geoHazardId)
                .then(function() {
                    return Observations.getStoredObservations(self.options.geoHazardId);
                 })
                .then(function (observations) {
                    var currentObs = null;
                    observations.forEach(function(obs) {
                        var obsLatLng = L.latLng(obs.Latitude, obs.Longitude);
                        if (latLng.distanceTo(obsLatLng) < 10) {
                            currentObs = obs;
                        }
                    });
                    self.loading = false;
                    if (currentObs) {
                        var obsObject = Observation.fromJson(currentObs);
                        $state.go('observationdetails', { observation: obsObject });
                    }
                });
        }
    });

    return NewRegistrationMarker;
});