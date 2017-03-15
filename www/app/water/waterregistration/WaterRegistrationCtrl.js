(function () {
    'use strict';

    function WaterRegistrationCtrl($scope, Registration) {

        var vm = this;

        vm.hasFooter = function () {
            return Registration.showSend();
        };

        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.data;
        });
    }

    angular
        .module('RegObs')
        .controller('WaterRegistrationCtrl', WaterRegistrationCtrl);

})();
