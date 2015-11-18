angular
    .module('RegObs')
    .controller('WaterRegistrationCtrl', function IceRegistrationCtrl($scope, Registration) {

        var vm = this;

        vm.propertyExists = Registration.propertyExists;
        vm.reg = Registration.data;


        $scope.$on('$ionicView.loaded', function(){});

    });
