angular
    .module('RegObs')
    .component('regobsImageThumbs', {
        bindings: {
            registrationProp: '@'
        },
        controller: function (Pictures, Registration) {
            var ctrl = this;
            ctrl.getPictures = function () {
                if (!ctrl.registrationProp) return [];
                if (ctrl.registrationProp === 'WaterLevel2') {
                    var arr = [];
                    var wm = Registration.data.WaterLevel2.WaterLevelMeasurement;
                    if (wm && angular.isArray(wm)) {
                        wm.forEach(function (item) {
                            if (item && item.Pictures && angular.isArray(item.Pictures)) {
                                item.Pictures.forEach(function (pic) {
                                    arr.push(pic);
                                });
                            }
                        });
                    }
                    return arr;
                } else {
                    return Pictures.getPictures(ctrl.registrationProp);
                }
            };
        },
        template: [
            '<span ng-repeat="pic in $ctrl.getPictures()">',
            '<img width="50" ng-src="{{pic.PictureImageBase64}}" />',
            '</span>'
        ].join('')
    });