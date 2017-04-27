(function () {
    'use strict';

    function PicturesService(Registration, RegobsPopup, Utility, AppSettings, $cordovaCamera, $cordovaDeviceOrientation, $q, $translate, $ionicPopup) {
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

        Pictures.showImageSelector = function (registrationTid) {
            return $q(function (resolve, reject) {
                var getImage = function (result) {
                    var processPictureResult = function (imageUri) {
                        var pic = {
                            RegistrationTID: registrationTid,
                            PictureImageBase64: imageUri,
                            PictureComment: ''
                        };

                        if (AppSettings.data.compass) {
                            Pictures.setOrientation(pic);
                        }

                        resolve(pic);
                    };


                    if (window.Camera) {
                        var options = result ? Pictures.defaultCameraOptions() : Pictures.defaultAlbumOptions();
                        return $cordovaCamera
                            .getPicture(options)
                            .then(processPictureResult, reject);
                    } else {
                        reject(new Error('No camera plugin found!'));
                    }
                };

                $translate(['ADD_PICTURE', 'ADD_PICTURE_DESCRIPTION', 'ALBUM', 'CAMERA']).then(function (translations) {
                    $ionicPopup.confirm({
                        title: translations['ADD_PICTURE'],
                        template: translations['ADD_PICTURE_DESCRIPTION'],
                        buttons: [
                            {
                                text: translations['ALBUM'],
                                type: 'button icon-left ion-images',
                                onTap: function (e) {
                                    // Returning a value will cause the promise to resolve with the given value.
                                    return false;
                                }
                            },
                            {
                                text: translations['CAMERA'],
                                type: 'button icon-left ion-camera',
                                onTap: function (e) {
                                    // Returning a value will cause the promise to resolve with the given value.
                                    return true;
                                }
                            }
                        ]
                    }).then(getImage);
                });
            });
        };

    }

    angular.module('RegObs')
        .service('Pictures', PicturesService);
})();