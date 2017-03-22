(function () {
    'use strict';

    function WaterRegistrationCtrl($scope, Registration) {

        var vm = this;



        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.data;
        });

        $scope.$on('$regobs.appModeChanged', Registration.createAndGoToNewRegistration);

    }

    angular
        .module('RegObs')
        .controller('WaterRegistrationCtrl', WaterRegistrationCtrl);

})();
