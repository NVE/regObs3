(function () {
    'use strict';

    var damageObsSummary = {
        bindings: {
            registration: '<'
        },
        templateUrl: 'app/directives/registrationdetail/summary/damageObsSummary.html',
        controller: function (Utility, $rootScope) {
            var ctrl = this;

            var update = function () {
                ctrl.fullObject = ctrl.registration.data.FullObject;
                ctrl.damageObs = ctrl.fullObject.filter(function (item) {
                    return item.DamageTypeTID !== 7;
                });
                ctrl.hasDamages = ctrl.damageObs.length > 0;
            };    

            Utility.getKdvArray('DamageTypeKDV', true).then(function (result) {
                ctrl.DamageObsTypeKdvArray = result;
            });

            ctrl.getDamageTypeName = function (tid) {
                if (ctrl.DamageObsTypeKdvArray) {
                    var match = ctrl.DamageObsTypeKdvArray.filter(function (item) {
                        return item.Id === tid;
                    });
                    if (match.length > 0) {
                        return match[0].Name;
                    }
                }
                return '';
            };

            ctrl.formatPosition = function (position) {
                return Utility.ddToDms(position.Latitude, position.Longitude);
            };

            ctrl.$onInit = function () {
                update();
            };

            ctrl.$onChanges = function () {
                update();
            };
        }
    };

    angular
        .module('RegObs')
        .component('observationTypeSummary99', damageObsSummary);
})();