angular.module('RegObs').component('observationTypeGeneric', {
    template: '<span class="registration-detail" ng-if="$ctrl.values.length"><strong class="registration-detail-type-header" ng-hide="$ctrl.showHeader === false">{{$ctrl.registration.getName()}}:&nbsp;</strong><span ng-repeat="desc in $ctrl.values track by $index"><span ng-if="$index > 0"><span ng-hide="$ctrl.showBullets===false">&nbsp;&bull;&nbsp;</span><span ng-show="$ctrl.showBullets===false"><br/></span></span><span ng-bind-html="desc.trim()"></span></span> </span>',
    controller: function ($scope, $rootScope, $timeout, Utility) {
        var ctrl = this;

        ctrl.values = [];

        var update = function () {
            if (ctrl.registration) {
                ctrl.registration.getValues()
                    .then(function (result) {
                        ctrl.values = result;
                    });
            }
        };

        ctrl.$onChanges = function () {
            update();
        };

        ctrl.$onInit = function () {
            update();
        };
    },
    bindings: {
        registration: '<',
        showHeader: '=',
        showBullets: '='
    }
});