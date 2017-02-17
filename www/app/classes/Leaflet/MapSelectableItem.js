/**
 * Selectable map item
 */
angular.module('RegObs')
    .factory('MapSelectableItem', function ($state, Registration, Trip, AppSettings) {

        var MapSelectableItem = L.Marker.extend({
            options: {
                setViewOnSelect: true, //Move map to this item on select?
                header: '',
                description: '',
                typeDescription: '',
                isSelected: false,
                geoHazardId: null,
                actionButtons: [
                {
                    extraClasses: 'regobs-button-tour',
                    buttonColor: '#fff',
                    iconColor: '#444',
                    icon: 'ion-android-walk',
                    isVisible: function() {
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
                    isVisible: function () {
                        return true;
                    }
                }]
            },

            initialize: function(latlng, options) {
                L.Util.setOptions(this, options);
                // call super
                L.Marker.prototype.initialize.call(this, latlng, this.options);
                this.on('click', this.setSelected);
            },

            isClickable: function() {
                var self = this;
                return angular.isFunction(self.onClick);
            },

            setSelected: function () {
                var self = this;
                if (!self.options.isSelected) {
                    if (self.options.selectedIcon) {
                        self.setIcon(self.options.selectedIcon);
                    }
                    self.options.isSelected = true;

                    self.fire('selected');
                }
            },

            setUnselected: function () {
                var self = this;
                if (self.options.isSelected) {
                    if (self.options.unselectedIcon) {
                        self.setIcon(self.options.unselectedIcon);
                    }
                    self.options.isSelected = false;

                    self.fire('unselected', self);
                }
            },

            getActionButtons: function() {
                return this.options.actionButtons;
            },

            setUserPosition: function (latlng) {
                this.options.userPosition = latlng;
            },

            hasImages: function () {
                return false;
            },
            getHeader: function () {
                return this.options.header || '';
            },
            setHeader: function (value) {
                this.options.header = value;
            },
            getDescription: function () {
                return this.options.description || '';
            },

            getDate: function () {
                return this.options.date;
            },

            setDescription: function (value) {
                this.options.description = value;
            },
            getTypeDescription: function () {
                return this.options.typeDescription || '';
            },
            setTypeDescription: function (value) {
                this.options.typeDescription = value;
            },
            setDistance: function (distance) {
                this.options.distance = distance;
            },
            getDistance: function () {
                return this.options.distance || '';
            },

            hasDistance: function () {
                return this.options.distance && this.options.distance.distance;
            },
            getDistanceText: function () {
                if (this.hasDistance()) {
                    return this.options.distance.description;
                } else {
                    return '';
                }
            },
            getGeoHazardId: function() {
                return this.options.geoHazardId;
            }
        });

        return MapSelectableItem;
    });