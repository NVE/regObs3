angular.module('RegObs')
    .factory('UserMarker', function ($cordovaDeviceOrientation, AppLogging) {
    var icon = L.divIcon({
        className: "leaflet-usermarker",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
        labelAnchor: [11, -3],
        html: '<div id="heading"></div>'
    });
    var iconPulsing = L.divIcon({
        className: "leaflet-usermarker",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
        labelAnchor: [11, -3],
        html: '<div id="heading"></div><i class="pulse"></i>'
    });

    var iconSmall = L.divIcon({
        className: "leaflet-usermarker-small",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -10],
        labelAnchor: [3, -4],
        html: '<div id="heading"></div></div>'
    });
    var iconPulsingSmall = L.divIcon({
        className: "leaflet-usermarker-small",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -10],
        labelAnchor: [3, -4],
        html: '<div id="heading"></div><i class="pulse"></i>'
    });
    var circleStyle = {
        stroke: true,
        color: "#03f",
        weight: 3,
        opacity: 0.5,
        fillOpacity: 0.15,
        fillColor: "#03f",
        clickable: false
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
                    self._watch = $cordovaDeviceOrientation.watchHeading({ frequency: 3000 });
                    self._watch.then(
                        null,
                        function (error) {
                            // An error occurred
                        },
                        function (result) {   // updates constantly (depending on frequency value)
                            var magneticHeading = result.magneticHeading;
                            AppLogging.log('Got heading: ' + magneticHeading);
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

            var element = document.getElementById("heading");
            var start = 90;
            var rotateZ = degrees - start;

            element.style['-webkit-transform'] = 'rotate(' + rotateZ + 'deg) translateX(15px)';
            element.style.display = 'block';
        },

        setPulsing: function (pulsing) {
            this._pulsing = pulsing;

            if (this.options.smallIcon) {
                this.setIcon(!!this._pulsing ? iconPulsingSmall : iconSmall);
            } else {
                this.setIcon(!!this._pulsing ? iconPulsing : icon);
            }
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