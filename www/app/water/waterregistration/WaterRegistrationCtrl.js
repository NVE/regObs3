(function () {
    'use strict';

    function WaterRegistrationCtrl($scope, Registration) {

        var vm = this;

        vm.propertyExists = Registration.propertyExists;
        vm.reg = Registration.data;        

        $scope.$on('$ionicView.loaded', function(){});

    }

    angular
        .module('RegObs')
        .controller('WaterRegistrationCtrl', WaterRegistrationCtrl);

})();
