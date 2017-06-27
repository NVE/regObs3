angular.module('RegObs').factory('NewRegistrationMarker', function (MapSelectableItem, Utility, $rootScope, $translate, Observations, Registration, Observation, $state) {

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
            if (!registration ||
                !registration.Id ||
                !registration.ObsLocation ||
                !registration.ObsLocation.Latitude ||
                !registration.ObsLocation.Longitude) {
                throw new Error('Invalid registration object!');
            }

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
            return $translate.instant('NEW_REGISTRATION');
        },

        //getDescription: function() {
        //    return 'Klikk for å laste ned';
        //},

        onClick: function () {
            //$rootScope.$broadcast('$regObs:updateObservations', this.registration);
            Observations.getRegistrationsById(this.registration.RegId).then(function (result) {
                return Registration.clearExistingNewRegistrations().then(function () {
                    $state.go('observationdetails', { observation: Observation.fromJson(result) });
                });
            })
        }
    });

    return NewRegistrationMarker;
});