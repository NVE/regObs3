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

            if (ctrl.registration.geoHazardTid) {
                var geoHazardName = Utility.getGeoHazardType(ctrl.registration.geoHazardTid);
                var kdvName = geoHazardName.charAt(0).toUpperCase() + geoHazardName.slice(1) + '_DamageTypeKDV';

                Utility.getKdvArray(kdvName, true).then(function (result) {
                    ctrl.DamageObsTypeKdvArray = result;
                });
            }

            ctrl.getDamageTypeName = function (tid) {
                if (ctrl.DamageObsTypeKdvArray && angular.isArray(ctrl.DamageObsTypeKdvArray)) {
                    var match = ctrl.DamageObsTypeKdvArray.filter(function (item) {
                        return item.Id === tid;
                    });
                    if (match.length > 0) {
                        return match[0].Name;
                    }
                }
                return '';
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
        .component('observationTypeSummary14', damageObsSummary);
})();