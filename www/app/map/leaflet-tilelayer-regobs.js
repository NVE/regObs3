/*
 * L.TileLayer.RegObs
 * A subclass of L.TileLayer which provides caching of tiles to a local filesystem using Cordova's File API
 * as well as methods for "switching" the layer between online mode (load from URLs) or offline mode (load from local stash)
 * Intended use is with Cordova/Phonegap applications, to cache tiles for later use.
 *
 * This plugin requires the following Cordova/Phonegap plugins:
 * File                 cordova plugins add org.apache.cordova.file
 * File-Transfer        cordova plugins add org.apache.cordova.file-transfer
 * Additionally, these Cordova/Phonegap plugins are invaluable for development and debugging:
 * Console              cordova plugins add org.apache.cordova.console
 *
 * It accepts the usual L.TileLayer options, plus the following (some are REQUIRED).
 * folder       REQUIRED. A folder path under which tiles are stored. The name of your app may be good, e.g. "My Trail App"
 * name         REQUIRED. A unique name for this TileLayer, for naming the tiles and then fetching them later. Keep it brief, e.g. "terrain"
 * debug        Boolean indicating whether to display verbose debugging out to console. Defaults to false. Great for using GapDebug, logcat, Xcode console, ...
 *
 * Accepts an optional success_callback, which will be called when the time-intensive filesystem activities are complete.
 */

L.tileLayerRegObs = function (url, options, success_callback) {
    return new L.TileLayer.RegObs(url, options, success_callback);
}

L.TileLayer.RegObs = L.TileLayer.extend({
    initialize: function (url, options, success_callback) {
        // check required options or else choke and die
        options = L.extend({
            folder: null,
            name: null,
            autocache: false,
            debugFunc: null,
            fallbackToZoomLevel: true,
            minNativeZoom: 0
        },
            options);
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
        //       if (!window.requestFileSystem && this.options.debug) console.log("L.TileLayer.RegObs: device does not support requestFileSystem");
        //       if (!window.requestFileSystem) throw "L.TileLayer.RegObs: device does not support requestFileSystem";
        //myself.debug("Opening filesystem");
        try {
        document.addEventListener("deviceready",
            function () {
                //window.requestFileSystem(
                //    LocalFileSystem.PERSISTENT,
                //    0,
                //    function (fshandle) {
                //        myself.debug("requestFileSystem OK " + options.folder);
                //        myself.fshandle = fshandle;
                //        myself.fshandle.root.getDirectory(
                //            options.folder,
                //            { create: true, exclusive: false },
                //            function (dirhandle) {
                //                myself.debug("getDirectory OK " + options.folder);
                //                myself.dirhandle = dirhandle;
                //                myself.dirhandle.setMetadata(null, null, { "com.apple.MobileBackup": 1 });

                //                // Android's toURL() has a trailing / but iOS does not; better to have 2 than to have 0 !
                //                myself._url_offline = dirhandle.toURL() +
                //                    '/' +
                //                    [myself.options.name, '{z}', '{x}', '{y}'].join('-') +
                //                    '.png';
                //                myself._url = myself._url_offline; //setting default url to offline url
                //                if (success_callback) success_callback();
                //            },
                //            function (error) {
                //                myself.debug("getDirectory failed (code " + error.code + ")" + options.folder);
                //                //throw "L.TileLayer.Cordova: " +
                //                //    options.name +
                //                //    ": getDirectory failed with code " +
                //                //    error.code;
                //            }
                //        );
                //    },
                //    function (error) {
                //        myself.debug("requestFileSystem failed (code " + error.code + ")" + options.folder);
                //        //throw "L.TileLayer.Cordova: " + options.name + ": requestFileSystem failed with code " + error.code;
                //    }
                //);
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

    createTile: function (coords, done) {
        var tile = L.TileLayer.prototype.createTile.call(this, coords, done);
        tile._originalCoords = coords;
        tile._originalSrc = tile.src;

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
        this.debug('Create current coords');
        this.debug('Original coords:' + JSON.stringify(originalCoords));

        var currentCoords = this._wrapCoords(originalCoords);

        currentCoords.fallback = true;


        this.debug('New current coords:' + JSON.stringify(currentCoords));

        return currentCoords;
    },

    _tileOnErrorScale: function (done, tile, e) {
        var layer = this, // `this` is bound to the Tile Layer in TLproto.createTile.
			originalCoords = tile._originalCoords,
			currentCoords = tile._currentCoords = tile._currentCoords || layer._createCurrentCoords(originalCoords),
			fallbackZoom = tile._fallbackZoom = (tile._fallbackZoom || originalCoords.z) - 1,
			scale = tile._fallbackScale = (tile._fallbackScale || 1) * 2,
			tileSize = layer.getTileSize(),
			style = tile.style,
			newUrl, top, left;

        if (currentCoords && (currentCoords.x === 0 && currentCoords.y === 0)) {
            currentCoords = tile._currentCoords = layer._createCurrentCoords(originalCoords);
        }

        // If no lower zoom tiles are available, fallback to errorTile.
        if (fallbackZoom < layer.options.minNativeZoom) {
            layer.debug("no lower zoom tiles are available, fallback to errorTile.");
            done(e, tile);
            return;
        }

        // Modify tilePoint for replacement img.
        currentCoords.z = fallbackZoom;
        currentCoords.x = Math.floor(currentCoords.x / 2);
        currentCoords.y = Math.floor(currentCoords.y / 2);

        // Generate new src path.
        newUrl = layer.getTileScaledUrl(currentCoords);

        layer.debug('Fallback to next zoom level: ' + fallbackZoom
            + ' for zoom: ' + originalCoords.z + 'new x: '
            + currentCoords.x + ' y: ' + currentCoords.y
            + ' original coordinates x: '
            + originalCoords.x + ' y: ' + originalCoords.y
            + ' minNativeZoom:' + layer.options.minNativeZoom);

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
        style.clip = 'rect(' + top + 'px ' + (left + tileSize.x) + 'px ' + (top + tileSize.y) + 'px ' + left + 'px)';

        layer.fire('tilefallback', {
            tile: tile,
            url: tile._originalSrc,
            urlMissing: tile.src,
            urlFallback: newUrl
        });

        tile.src = newUrl;
    },

    _tileOnError: function (done, tile, e) {
        var layer = this;
        if (tile.fallbackToOnline) { //Online has been tried, try to scale instead
            if (layer.options.fallbackToZoomLevel) {
                layer._tileOnErrorScale(done, tile, e);
            } else {
                done(e, tile);
            }
        } else {
            var newUrl = layer.getTileOnlineUrl(tile._originalCoords);
            layer.debug("Could not find local tile: " + tile._originalSrc + ". Try to fallback to online tile: " + newUrl);
            tile.fallbackToOnline = true; //Try to fallback to online map tile

            layer.fire('tilefallback',
            {
                tile: tile,
                url: tile._originalSrc,
                urlMissing: tile.src,
                urlFallback: newUrl
            });

            tile.src = newUrl;
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
    },

    /*
     *
     * Other maintenance functions, e.g. count up the cache's usage, and empty the cache
     *
     */

    //getDiskUsage: function (callback) {
    //    var myself = this;
    //    if (!myself.dirhandle) {
    //        if (callback) callback(0, 0);
    //        return;
    //    }

    //    var dirReader = myself.dirhandle.createReader();
    //    dirReader.readEntries(function (entries) {
    //        // a mix of files & directories. In our case we know it's all files and all cached tiles, so just add up the filesize
    //        var files = 0;
    //        var bytes = 0;

    //        function processFileEntry(index) {
    //            if (index >= entries.length) {
    //                if (callback) callback(files, bytes);
    //                return;
    //            }

    //            // if (myself.options.debug) console.log( entries[index] );
    //            entries[index].file(
    //                function (fileinfo) {
    //                    bytes += fileinfo.size;
    //                    files++;
    //                    processFileEntry(index + 1);
    //                },
    //                function () {
    //                    // failed to get file info? impossible, but if it somehow happens just skip on to the next file
    //                    processFileEntry(index + 1);
    //                }
    //            );
    //        }
    //        processFileEntry(0);
    //    }, function () {
    //        throw "L.TileLayer.RegObs: getDiskUsage: Failed to read directory";
    //    });
    //},

    //getDiskUsageForXyzList: function (xyzList, callback) {
    //    var myself = this;
    //    if (!myself.dirhandle) {
    //        if (callback) callback(0, 0);
    //        return;
    //    }

    //    var dirReader = myself.dirhandle.createReader();
    //    dirReader.readEntries(function (entries) {
    //        // a mix of files & directories. In our case we know it's all files and all cached tiles, so just add up the filesize
    //        var files = 0;
    //        var bytes = 0;

    //        var fileExistsInXyzList = function (name) {
    //            var found = false;
    //            xyzList.forEach(function (item) {
    //                var mapname = myself.getMapFilename(item.x, item.y, item.z);
    //                if (mapname === name) {
    //                    found = true;
    //                    return;
    //                }
    //            });
    //            return found;
    //        };

    //        function processFileEntry(index) {
    //            if (index >= entries.length) {
    //                if (callback) callback(files, bytes);
    //                return;
    //            }

    //            // if (myself.options.debug) console.log( entries[index] );
    //            entries[index].file(
    //                function (fileinfo) {
    //                    myself.debug('File:' + JSON.stringify(fileinfo));
    //                    if (fileExistsInXyzList(fileinfo.name)) {
    //                        bytes += fileinfo.size;
    //                        files++;
    //                    }
    //                    processFileEntry(index + 1);
    //                },
    //                function () {
    //                    // failed to get file info? impossible, but if it somehow happens just skip on to the next file
    //                    processFileEntry(index + 1);
    //                }
    //            );
    //        }
    //        processFileEntry(0);
    //    }, function () {
    //        throw "L.TileLayer.RegObs: getDiskUsage: Failed to read directory";
    //    });
    //}

    //emptyCache: function (callback) {
    //    var myself = this;
    //    if (myself.dirhandle) {
    //        var dirReader = myself.dirhandle.createReader();
    //        dirReader.readEntries(function (entries) {
    //            var success = 0;
    //            var failed = 0;

    //            function processFileEntry(index) {
    //                if (index >= entries.length) {
    //                    if (callback) callback(success, failed);
    //                    return;
    //                }

    //                // if (myself.options.debug) console.log( entries[index] );
    //                entries[index].remove(
    //                    function () {
    //                        success++;
    //                        processFileEntry(index + 1);
    //                    },
    //                    function () {
    //                        failed++;
    //                        processFileEntry(index + 1);
    //                    }
    //                );
    //            }

    //            processFileEntry(0);
    //        },
    //            function () {
    //                throw "L.TileLayer.RegObs: emptyCache: Failed to read directory";
    //            });
    //    } else {
    //        if (callback) callback(0, 0);
    //    }
    //},

    //getCacheContents: function (done_callback) {
    //    var myself = this;
    //    var dirReader = myself.dirhandle.createReader();
    //    dirReader.readEntries(function (entries) {

    //        var retval = [];
    //        for (var i = 0; i < entries.length; i++) {
    //            var e = entries[i];
    //            if (e.isFile) {

    //                var myEntry = {
    //                    name: e.name,
    //                    fullPath: e.fullPath,
    //                    nativeURL: e.nativeURL
    //                };

    //                // Extract the x,y,z pieces from the filename.
    //                var parts_outer = e.name.split(".");
    //                if (parts_outer.length >= 1) {
    //                    var parts = parts_outer[0].split('-');
    //                    if (parts.length >= 4) {
    //                        myEntry['z'] = parts[1];
    //                        myEntry['x'] = parts[2];
    //                        myEntry['y'] = parts[3];
    //                        myEntry['lat'] = myself.getLat(myEntry.y, myEntry.z);
    //                        myEntry['lng'] = myself.getLng(myEntry.x, myEntry.z);
    //                    }
    //                }

    //                retval.push(myEntry);
    //            }
    //        }

    //        if (done_callback) done_callback(retval);

    //    }, function () {
    //        throw "L.TileLayer.RegObs: getCacheContents: Failed to read directory";
    //    });
    //}

}); // end of L.TileLayer.RegObs class