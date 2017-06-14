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
                return Pictures.getPictures(ctrl.registrationProp);              
            };
        },
        template: [
            '<span ng-repeat="pic in $ctrl.getPictures()">',
            '<img width="50" ng-src="{{pic.PictureImageBase64}}" />',
            '</span>'
        ].join('')
    });