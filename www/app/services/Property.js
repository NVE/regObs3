/**
 * Created by storskel on 26.04.2016.
 */
(function () {
    'use strict';

    function PropertyService($rootScope, Registration, Pictures, RegobsPopup) {
        'ngInject';

        var Property = this;

        Property.exists = function (prop) {
            return Registration.propertyExists(prop) || Pictures.hasPictures(prop) || (prop === 'AvalancheObs' && Registration.propertyExists('Incident'));
        };

        Property.reset = function (prop, force) {
            if (Property.exists(prop)){
                if(force){
                    resetProperty(prop);
                } else {
                    RegobsPopup
                        .delete('Tøm skjema?', 'Vil du nullstille dette skjemaet?', 'Nullstill')
                        .then(function (res) {
                            if (res) {
                                resetProperty(prop);
                            }
                        });
                }
            }
        };

        function resetProperty(prop){
            Registration.resetProperty(prop);
            if (prop === 'AvalancheObs') {
                Registration.resetProperty('Incident');
            }
            Pictures.removePictures(prop);
            $rootScope.$broadcast('$ionicView.loaded');
            $rootScope.$broadcast('$regobs:propertyReset', prop);
        }
    }

    angular.module('RegObs')
        .service('Property', PropertyService);
})();