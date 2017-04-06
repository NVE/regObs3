(function () {
    'use strict';

    function PicturesService(Registration, RegobsPopup, Utility, AppSettings, $cordovaCamera, $cordovaDeviceOrientation) {
        'ngInject';
        var Pictures = this;

        Pictures.defaultCameraOptions = function () {
            return {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 1200,
                targetHeight: 1200,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: true,
                correctOrientation: true
            }
        };

        Pictures.defaultAlbumOptions = function () {
            var options = Pictures.defaultCameraOptions();
            options.quality = 40;
            options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
            return options;
        };

        var cache = {}; //To prevent filtering happening all the time

        Pictures.hasPictures = function (propertyKey) {
            return !!Pictures.getPictures(propertyKey).length;
        };

        Pictures.addPicture = function (propertyKey, data) {
            Registration.initPropertyAsArray('Picture');
            var pic = {
                RegistrationTID: Utility.registrationTid(propertyKey),
                PictureImageBase64: data,
                PictureComment: ''
            };
            Registration.data.Picture.push(pic);
            cache = {};
            return pic;
        };

        Pictures.getPictures = function (propertyKey) {
            if (angular.isArray(Registration.data.Picture) && Registration.data.Picture.length) {
                if (cache[propertyKey]) {
                    return cache[propertyKey];
                } else {
                    var registrationTid = Utility.registrationTid(propertyKey);

                    var filteredList = Registration.data.Picture.filter(function (pic) {
                        return pic.RegistrationTID === registrationTid;
                    });
                    cache[propertyKey] = filteredList;
                    return filteredList;
                }
            }
            cache = {};
            return [];
        };

        Pictures.deletePicture = function (picture) {

            RegobsPopup.delete('Fjern bilde', 'Vil du fjerne dette bildet fra registreringen?', 'Fjern')
                .then(function (confirmed) {
                    if (confirmed) {
                        for (var i = 0; i < Registration.data.Picture.length; i++) {
                            var obj = Registration.data.Picture[i];
                            if (obj.PictureImageBase64 === picture.PictureImageBase64) {
                                Registration.data.Picture.splice(i, 1);
                                cache = {};
                                return true;
                            }

                        }
                    }

                });

        };

        Pictures.removePictures = function (propertyKey) {
            if (angular.isArray(Registration.data.Picture)) {
                var tid = Utility.registrationTid(propertyKey);
                Registration.data.Picture = Registration.data.Picture.filter(function (pic, index) {
                    return pic.RegistrationTID !== tid;
                });
                cache = {};
            }
        };

        Pictures.setOrientation = function (pic) {
            $cordovaDeviceOrientation
                .getCurrentHeading()
                .then(function (result) {
                    /*var trueHeading = result.trueHeading;
                     var accuracy = result.headingAccuracy;
                     var timeStamp = result.timestamp;*/
                    var magneticHeading = result.magneticHeading;
                    pic.Aspect = magneticHeading.toFixed(0);
                }, function (err) {
                    // An error occurred
                    pic.Aspect = -1;
                });
        };

        Pictures._processPictureResult = function (registrationProp, imageUri) {
            var pic = Pictures.addPicture(registrationProp, imageUri);
            //image.src = "data:image/jpeg;base64," + imageData;
            if (AppSettings.data.compass) {
                Pictures.setOrientation(pic);
            }
            return pic;
        };

        Pictures.getCameraPicture = function (registrationProp, options) {
            if (!registrationProp) throw Error('No registration prop set');
            return $cordovaCamera
                .getPicture(options || Pictures.defaultCameraOptions())
                .then(function (imageUri) {
                    return Pictures._processPictureResult(registrationProp, imageUri);
                }, function (err) {
                    // error
                    AppLogging.log('Cold not get camera picture');
                    return null;
                });
        };

        Pictures.getAlbumPicture = function (registrationProp, options) {
            if (!registrationProp) throw Error('No registration prop set');
            return $cordovaCamera
                .getPicture(options || Pictures.defaultAlbumOptions())
                .then(function (imageUri) {
                    return Pictures._processPictureResult(registrationProp, imageUri);
                }, function (err) {
                    // error
                    AppLogging.log('Cold not get album picture');
                    return null;
                });
        };

    }

    angular.module('RegObs')
        .service('Pictures', PicturesService);
})();