angular.module('RegObs').factory('RegObsTileLayer', function (AppSettings) {
    var RegObsTileLayer = L.TileLayer.extend({
        initialize: function (url, options) {
            // check required options or else choke and die
            options = L.extend({
                folder: null,
                name: null,
                autocache: false,
                debugFunc: null,
                fallbackToZoomLevel: true,
                minNativeZoom: 0
            }, options);
            if (!options.folder) throw "L.TileLayer.Cordova: missing required option: folder";
            if (!options.name) throw "L.TileLayer.Cordova: missing required option: name";
            L.TileLayer.prototype.initialize.call(this, url, options);
            L.setOptions(this, options);

            // connect to the filesystem or else die loudly
            // save a handle to the filesystem, and also use it to open a directory handle to our stated folder
            // thus: self.fshandle and self.dirhandle
            //
            // also set the ._url for both online and offline use
            // we have two versions of URL which may be the _url at any given time: offline and online
            // online is the HTTP one we were given as the 'url' parameter here to initialize()
            // offline is underneath the local filesystem: /path/to/sdcard/FOLDER/name-z-x-y.png
            // tip: the file extension isn't really relevant; using .png works fine without juggling file extensions from their URL templates
            var myself = this;

            myself._url_online = myself._url; // Do this early, so it's done before the time-intensive filesystem activity starts.
            myself._url_offline = myself._url; //Fallback to online map if no device storage present.
            try {
                document.addEventListener("deviceready",
                    function () {
                        myself._url_offline = cordova.file.dataDirectory + myself.options.folder + '/' + [myself.options.name, '{z}', '{x}', '{y}'].join('-') + '.png';
                        if (!myself._url_offline.startsWith('file://tmp/ripple')) {
                            myself._url = myself._url_offline; //only offer offline mode when not emulating
                        }

                    });
            } catch (error) {
                myself.debug("requestFileSystem failed (" + error.message + ")" + options.folder);
            }

            // done, return ourselves because method chaining is cool
            return this;
        },

        debug: function (message) {
            var tile = this;
            if (tile.options.debugFunc) {
                tile.options.debugFunc(message);
            }
        },

        _checkEmbeddedTiles: function(tile, coords) {
            if (this.options.embeddedUrl && coords.z <= this.options.embeddedMaxZoom) {
                this.debug('Using embedded map for zoom:' + coords.z);
                tile.isEmbedded = true;
                tile.src = L.Util.template(this.options.embeddedUrl, coords);
            }
        },

        createTile: function (coords, done) {
            var tile = L.TileLayer.prototype.createTile.call(this, coords, done);
            tile._originalCoords = coords;
            tile._originalSrc = tile.src;
            this._checkEmbeddedTiles(tile, coords);

            return tile;
        },

        getTileOnlineUrl: function (coords) {
            var data = {
                r: L.Browser.retina ? '@2x' : '',
                s: this._getSubdomain(coords),
                x: coords.x,
                y: coords.y,
                z: coords.z
            };
            return L.Util.template(this._url_online, L.extend(data, this.options));
        },

        getTileOfflineUrl: function (coords) {
            var data = {
                r: L.Browser.retina ? '@2x' : '',
                s: this._getSubdomain(coords),
                x: coords.x,
                y: coords.y,
                z: coords.z
            };
            return L.Util.template(this._url_offline, L.extend(data, this.options));
        },

        getTileScaledUrl: function (coords) {
            var z = coords.z = coords.fallback ? coords.z : this._getZoomForUrl();

            var data = {
                r: L.Browser.retina ? '@2x' : '',
                s: this._getSubdomain(coords),
                x: coords.x,
                y: coords.y,
                z: z
            };
            if (this._map && !this._map.options.crs.infinite) {
                var invertedY = this._globalTileRange.max.y - coords.y;
                if (this.options.tms) {
                    data['y'] = invertedY;
                }
                data['-y'] = invertedY;
            }

            return L.Util.template(this._url, L.extend(data, this.options));
        },

        _createCurrentCoords: function (originalCoords) {
            var currentCoords = this._wrapCoords(originalCoords);
            currentCoords.fallback = true;
            return currentCoords;
        },

        _originalTileOnError: L.TileLayer.prototype._tileOnError,

        _tileFallbackToOnline: function (done, tile, e) {
            var layer = this;
            var newUrl = layer.getTileOnlineUrl(tile._originalCoords);
            layer.debug("Try to fallback to online tile: " + newUrl);
            tile.fallbackToOnline = true; //setting flag for online fallback

            layer.fire('tilefallback',
            {
                tile: tile,
                url: tile._originalSrc,
                urlMissing: tile.src,
                urlFallback: newUrl
            });

            tile.src = newUrl;
        },

        _tileOnError: function (done, tile, e) {
            var layer = this; // `this` is bound to the Tile Layer in TLproto.createTile.
               
            if (!tile.fallbackToOnline) { //Try first to get online tile
                layer._tileFallbackToOnline(done, tile, e);
            } else {
                //online tile has been tried, try to scale offline url
                var originalCoords = tile._originalCoords,
                currentCoords = tile._currentCoords = tile._currentCoords || layer._createCurrentCoords(originalCoords),
                fallbackZoom = tile._fallbackZoom = (tile._fallbackZoom || originalCoords.z) - 1,
                scale = tile._fallbackScale = (tile._fallbackScale || 1) * 2,
                tileSize = layer.getTileSize(),
                style = tile.style,
                newUrl, top, left;             

                // If no lower zoom tiles are available, fallback to errorTile.
                if (fallbackZoom < 1) {
                    layer.debug('Max fallback reached. Return error');
                    return layer._originalTileOnError(done, tile, e);
                }

                tile.fallbackToOnline = false; //try fallbackZoom for offline tile first

                // Modify tilePoint for replacement img.
                currentCoords.z = fallbackZoom;
                currentCoords.x = Math.floor(currentCoords.x / 2);
                currentCoords.y = Math.floor(currentCoords.y / 2);

                // Generate new src path.
                newUrl = layer.getTileOfflineUrl(currentCoords);

                layer.debug('Fallback to next zoom level: ' + fallbackZoom+ ' for zoom: ' + originalCoords.z + ' original: ' + JSON.stringify(originalCoords) + ' new coords: ' + JSON.stringify(currentCoords));

                // Zoom replacement img.
                style.width = (tileSize.x * scale) + 'px';
                style.height = (tileSize.y * scale) + 'px';

                // Compute margins to adjust position.
                top = (originalCoords.y - currentCoords.y * scale) * tileSize.y;
                style.marginTop = (-top) + 'px';
                left = (originalCoords.x - currentCoords.x * scale) * tileSize.x;
                style.marginLeft = (-left) + 'px';

                // Crop (clip) image.
                // `clip` is deprecated, but browsers support for `clip-path: inset()` is far behind.
                // http://caniuse.com/#feat=css-clip-path
                style.clip = 'rect(' +
                    top +
                    'px ' +
                    (left + tileSize.x) +
                    'px ' +
                    (top + tileSize.y) +
                    'px ' +
                    left +
                    'px)';

                tile.src = newUrl;
                this._checkEmbeddedTiles(tile, currentCoords);

                layer.fire('tilefallback',
                {
                    tile: tile,
                    url: tile._originalSrc,
                    urlMissing: tile.src,
                    urlFallback: newUrl
                });

                
            }
        },

        /*
         * Toggle between online and offline functionality
         * essentially this just calls setURL() with either the ._url_online or ._url_offline, and lets L.TileLayer reload the tiles... or try, anyway
         */

        goOnline: function () {
            // use this layer in online mode
            this.setUrl(this._url_online);
        },
        goOffline: function () {
            // use this layer in online mode
            this.setUrl(this._url_offline);
        },

        /*
         * Returns current online/offline state.
         */

        isOnline: function () {
            return (this._url === this._url_online);
        },
        isOffline: function () {
            return (this._url === this._url_offline);
        },

        /*
         * A set of functions to do the tile downloads, and to provide suporting calculations related thereto
         * In particular, a user interface for downloading tiles en masse, would call calculateXYZListFromPyramid() to egt a list of tiles,
         * then make decisions about whether this is a good idea (e.g. too many tiles), then call downloadXYZList() with success/error callbacks
         */

        calculateXYZListFromPyramid: function (lat, lon, zmin, zmax) {
            // given a latitude and longitude, and a range of zoom levels, return the list of XYZ trios comprising that view
            // the caller may then call downloadXYZList() with progress and error callbacks to do that fetching

            var xyzlist = [];
            for (z = zmin; z <= zmax; z++) {
                var t_x = this.getX(lon, z);
                var t_y = this.getY(lat, z);

                var radius = z == zmin ? 0 : Math.pow(2, z - zmin - 1);
                this.debug("Calculate pyramid: Z " + z + " : " + "Radius of " + radius);

                for (var x = t_x - radius; x <= t_x + radius; x++) {
                    for (var y = t_y - radius; y <= t_y + radius; y++) {
                        xyzlist.push({ x: x, y: y, z: z });
                    }
                }
            }

            // done!
            return xyzlist;
        },

        calculateXYZListFromBounds: function (bounds, zmin, zmax) {
            // Given a bounds (such as that obtained by calling MAP.getBounds()) and a range of zoom levels, returns the list of XYZ trios comprising that view.
            // The caller may then call downloadXYZList() with progress and error callbacks to do the fetching.

            var xyzlist = [];

            for (z = zmin; z <= zmax; z++) {

                // Figure out the tile for the northwest point of the bounds.
                t1_x = this.getX(bounds.getNorthWest().lng, z);
                t1_y = this.getY(bounds.getNorthWest().lat, z);

                // Figure out the tile for the southeast point of the bounds.
                t2_x = this.getX(bounds.getSouthEast().lng, z);
                t2_y = this.getY(bounds.getSouthEast().lat, z);

                // Now that we have the coordinates of the two opposing points (in the correct order!), we can iterate over the square.
                for (var x = t1_x; x <= t2_x; x++) {
                    for (var y = t1_y; y <= t2_y; y++) {
                        xyzlist.push({ x: x, y: y, z: z });
                    }
                }

            }

            return xyzlist;

        },

        calculateXYZSizeFromBounds: function (bounds, zmin, zmax) {
            // Given a bounds (such as that obtained by calling MAP.getBounds()) and a range of zoom levels, returns the list of XYZ trios comprising that view.
            // The caller may then call downloadXYZList() with progress and error callbacks to do the fetching.

            var xyzlist = 0;

            for (z = zmin; z <= zmax; z++) {

                // Figure out the tile for the northwest point of the bounds.
                t1_x = this.getX(bounds.getNorthWest().lng, z);
                t1_y = this.getY(bounds.getNorthWest().lat, z);

                // Figure out the tile for the southeast point of the bounds.
                t2_x = this.getX(bounds.getSouthEast().lng, z);
                t2_y = this.getY(bounds.getSouthEast().lat, z);

                // Now that we have the coordinates of the two opposing points (in the correct order!), we can iterate over the square.
                for (var x = t1_x; x <= t2_x; x++) {
                    for (var y = t1_y; y <= t2_y; y++) {
                        xyzlist++;
                    }
                }

            }

            return xyzlist;
        },

        getX: function (lon, z) {
            return Math.floor((lon + 180) / 360 * Math.pow(2, z));
        },

        getY: function (lat, z) {
            return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
        },

        getLng: function (x, z) {
            return (x / Math.pow(2, z) * 360 - 180);
        },

        getLat: function (y, z) {
            var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
            return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
        },

        getMapFilename: function (x, y, z) {
            return [this.options.name, z, x, y].join('-') + '.png';
        }
    });
    return RegObsTileLayer;
});