angular.module('RegObs')
    .factory('UserMarker', function ($cordovaDeviceOrientation, AppLogging, Utility) {

    var circleStyle = {
        stroke: true,
        color: "#03f",
        weight: 3,
        opacity: 0.5,
        fillOpacity: 0.15,
        fillColor: "#03f",
        clickable: false
    };

    var getIcon = function (id, small, pulsing) {
        return L.divIcon({
            className: small ? 'leaflet-usermarker-small' : 'leaflet-usermarker',
            iconSize: small ? [18, 18] : [34, 34],
            iconAnchor: small ? [9, 9] : [17, 17],
            popupAnchor: small ? [0, -10] : [0, -20],
            labelAnchor: small ? [3, -4] : [11, -3],
            html: '<div class="heading" id="' + id + '"></div>' + (pulsing ? '<i class="pulse"></i>' : '')
        });
    };

    var UserMarker = L.Marker.extend({
        options: {
            pulsing: true,
            smallIcon: true,
            watchHeading: true,
            accuracy: 0,
            circleOpts: circleStyle
        },

        initialize: function (latlng, options) {
            options = L.Util.setOptions(this, options);

            this._id = Utility.createGuid();
            this.setPulsing(this.options.pulsing);
            this._accMarker = L.circle(latlng, this.options.accuracy, this.options.circleOpts);

            if (this.options.watchHeading) {
                this.watchHeading();
            }

            // call super
            L.Marker.prototype.initialize.call(this, latlng, this.options);

            this.on("move", function () {
                this._accMarker.setLatLng(this.getLatLng());
            }).on("remove", function () {
                this.clearHeadingWatch();
                this._map.removeLayer(this._accMarker);
            });
        },

        watchHeading: function () {
            var self = this;
            if (!self._isWatching) {
                self._isWatching = true;
                document.addEventListener("deviceready", function () {
                    AppLogging.log('start watching heading');
                    self._watch = $cordovaDeviceOrientation.watchHeading({ frequency: 500 });
                    self._watch.then(
                        null,
                        function (error) {
                            // An error occurred
                        },
                        function (result) {   // updates constantly (depending on frequency value)
                            var magneticHeading = result.magneticHeading;
                            self.setHeading(parseInt(result.magneticHeading));
                        });
                    
                });
            }
        },

        clearHeadingWatch: function () {
            var self = this;
            if (self._watch) {
                self._watch.clearWatch();
                self._isWatching = false;
                AppLogging.log('stop watching heading');
            }
        },

        setHeading: function (degrees) {
            this._heading = degrees;

            var element = document.getElementById(this._id);
            var start = 90;
            var rotateZ = degrees - start;

            element.style['-webkit-transform'] = 'rotate(' + rotateZ + 'deg) translateX(15px)';
            element.style.display = 'block';
        },

        setPulsing: function (pulsing) {
            this._pulsing = pulsing;

            var icon = getIcon(this._id, this.options.smallIcon, this._pulsing);
            this.setIcon(icon);
        },

        setAccuracy: function (accuracy) {
            this._accuracy = accuracy;
            if (!this._accMarker) {
                this._accMarker = L.circle(this._latlng, accuracy, this.options.circleOpts).addTo(this._map);
            } else {
                this._accMarker.setRadius(accuracy);
            }
        },

        onAdd: function (map) {
            // super
            L.Marker.prototype.onAdd.call(this, map);
            this._accMarker.addTo(map);
        }
    });

    return UserMarker;
});