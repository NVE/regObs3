(function () {
    'use strict';

    function WaterRegistrationCtrl($scope, Registration) {

        var vm = this;



        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.data;
        });

    }

    angular
        .module('RegObs')
        .controller('WaterRegistrationCtrl', WaterRegistrationCtrl);

})();
