/**
 * Created by storskel on 06.10.2015.
 */
angular
    .module('RegObs')
    .factory('Utility', function Utility($http, $q, $rootScope, AppSettings, User, LocalStorage) {
        var service = this;

        var canvas;

        var geoHazardTid = {
            snow: 10,
            dirt: 20,
            water: 60,
            ice: 70
        };
        var DAYS_BEFORE_KDV_UPDATE = 7;
        var geoHazardNames = {};
        geoHazardNames[geoHazardTid.snow] = 'snø';
        geoHazardNames[geoHazardTid.dirt] = 'jord';
        geoHazardNames[geoHazardTid.ice] = 'is';
        geoHazardNames[geoHazardTid.water] = 'vann';

        //Brukt der det er bilder (RegistrationTID)
        var OBSERVATIONS = {
            Incident: {
                name: "Ulykke/Hendelse",
                RegistrationTID: "11"
            },
            DangerObs: {
                name: "Faretegn",
                RegistrationTID: "13"
            },
            SnowSurfaceObservation: {
                name: "Snødekke",
                RegistrationTID: "22"
            },
            AvalancheActivityObs: {
                name: "Skredaktivitet",
                RegistrationTID: "27"
            },
            AvalancheActivityObs2: {
                name: "Skredaktivitet",
                RegistrationTID: "33"
            },
            AvalancheObs: {
                name: "Snøskred",
                RegistrationTID: "26"
            },
            WeatherObservation: {
                name: "Vær",
                RegistrationTID: "21"
            },
            SnowProfile: {
                name: "Snøprofil",
                RegistrationTID: "23"
            },
            AvalancheEvalProblem2: {
                name: "Skredproblem",
                RegistrationTID: "32"
            },
            AvalancheEvaluation3: {
                name: "Skredfarevurdering",
                RegistrationTID: "31"
            },
            Picture: {
                name: "Bilde",
                RegistrationTID: "12"
            },
            IceCoverObs: {
                name: "Isdekningsgrad",
                RegistrationTID: "51"
            },
            IceThickness: {
                name: "Snø og istykkelse",
                RegistrationTID: "50"
            },
            WaterLevel: {
                name: "Vannstand",
                RegistrationTID: "61"
            },
            LandSlideObs: {
                name: "Skredhendelse",
                RegistrationTID: "71"
            },
            GeneralObservation: {
                name: "Fritekst",
                RegistrationTID: "10"
            }
        };

        service.registrationTid = function (prop) {
            return OBSERVATIONS[prop].RegistrationTID;
        };

        service.geoHazardNames = function (tid) {
            return geoHazardNames[tid];
        };

        service.geoHazardTid = function (type) {
            return (isNaN(type) ? geoHazardTid[type] : type);
        };

        //Antall tegn: 8-4-4-12
        //Format: xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx
        service.createGuid = function () {
            return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
        };

        service.getKdvElements = function () {

            var deferred = $q.defer();
            var kdvFromStorage = LocalStorage.getObject('kdvDropdowns');
            if (kdvFromStorage && kdvFromStorage.KdvRepositories) {
                deferred.resolve({data: kdvFromStorage});
                return deferred.promise;

            } else {
                return $http.get('app/json/kdvElements.json');
            }

        };

        service.shouldUpdateKdvElements = function () {
            var timeDiff, diffDays;
            var lastUpdate = LocalStorage.get('kdvUpdated', '2016-01-01');
            var now = new Date();

            lastUpdate = new Date(lastUpdate);
            console.log('Last update', lastUpdate);

            timeDiff = Math.abs(now.getTime() - lastUpdate.getTime());
            diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            console.log('Difference days', diffDays);

            return diffDays > DAYS_BEFORE_KDV_UPDATE;
        };

        service.refreshKdvElements = function () {
            User.refreshObserverGroups();
            return $http.get(AppSettings.getEndPoints().getDropdowns, AppSettings.httpConfig)
                .then(function (res) {

                    if (res.data && res.data.Data) {
                        var newDate = Date.now();
                        LocalStorage.set('kdvDropdowns', res.data.Data);
                        LocalStorage.set('kdvUpdated', newDate);
                        $rootScope.$broadcast('kdvUpdated', newDate);
                    }
                });

        };

        service.getKdvRepositories = function () {
            return service
                .getKdvElements()
                .then(function (response) {
                    return response.data.KdvRepositories;
                });
        };

        service.getViewRepositories = function () {
            return service
                .getKdvElements()
                .then(function (response) {
                    return response.data.ViewRepositories;
                });
        };

        service.getKdvArray = function (key) {
            return service
                .getKdvRepositories()
                .then(function (KdvRepositories) {
                    return KdvRepositories[key];
                });
        };

        service.twoDecimal = function (num) {
            return service.nDecimal(num, 2);
        };

        service.nDecimal = function (num, n) {
            console.log(num);
            return parseFloat(num.toFixed(n))
        };

        service.isEmpty = function (obj) {

            // null and undefined are "empty"
            if (obj == null) return true;

            // Assume if it has a length property with a non-zero value
            // that that property is correct.
            if (obj.length > 0)    return false;
            if (obj.length === 0)  return true;

            // Otherwise, does it have any properties of its own?
            // Note that this doesn't handle
            // toString and valueOf enumeration bugs in IE < 9
            for (var key in obj) {
                if (obj[key] || obj[key] === 0) return false;
            }

            return true;
        };

        service.resizeImage = function resizeImage(longSideMax, url, callback) {
            var tempImg = new Image();
            tempImg.src = url;
            tempImg.onload = function () {
                // Get image size and aspect ratio.
                var targetWidth = tempImg.width;
                var targetHeight = tempImg.height;
                var aspect = tempImg.width / tempImg.height;

                // Calculate shorter side length, keeping aspect ratio on image.
                // If source image size is less than given longSideMax, then it need to be
                // considered instead.
                if (tempImg.width > tempImg.height) {
                    longSideMax = Math.min(tempImg.width, longSideMax);
                    targetWidth = longSideMax;
                    targetHeight = longSideMax / aspect;
                }
                else {
                    longSideMax = Math.min(tempImg.height, longSideMax);
                    targetHeight = longSideMax;
                    targetWidth = longSideMax * aspect;
                }

                // Create canvas of required size.
                if (!canvas) canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                var ctx = canvas.getContext("2d");
                // Take image from top left corner to bottom right corner and draw the image
                // on canvas to completely fill into.
                ctx.drawImage(this, 0, 0, tempImg.width, tempImg.height, 0, 0, targetWidth, targetHeight);

                callback(canvas.toDataURL("image/jpeg", 0.4));
            };
        };

        service.resizeAllImages = function (data) {
            var deferred = $q.defer();
            var picturePresent, i, reg;
            if (data && data.Registrations) {
                picturePresent = 0;
                for (i = 0; i < data.Registrations.length; i++) {
                    reg = data.Registrations[i];
                    if (reg.Picture) {
                        picturePresent += reg.Picture.length;
                        reg.Picture.forEach(function (pic) {
                            service.resizeImage(1200, pic.PictureImageBase64, function (imageData) {
                                pic.PictureImageBase64 = imageData;
                                picturePresent = picturePresent - 1;
                                if (!picturePresent) {
                                    deferred.resolve(data);
                                }
                            });
                        });
                        console.log(reg.Picture);
                    }
                }
            }

            if (!picturePresent) {
                deferred.resolve(data);
            }

            return deferred.promise;
        };

        /**
         * @return {string}
         */
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return service;

    });