angular
    .module('RegObs')
    .controller('WaterRegistrationCtrl', function IceRegistrationCtrl($scope, Registration) {

        var vm = this;

        vm.propertyExists = Registration.propertyExists;
        vm.reg = Registration.data;
        vm.DtObsTime = new Date(vm.reg.DtObsTime);


        $scope.$on('$ionicView.loaded', function(){});

    });
