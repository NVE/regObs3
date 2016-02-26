(function () {
    'use strict';

    function PicturesService(Registration, RegobsPopup, Utility) {
        var Pictures = this;

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
    }

    angular.module('RegObs')
        .service('Pictures', PicturesService);
})();