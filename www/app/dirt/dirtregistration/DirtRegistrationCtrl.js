angular
    .module('RegObs')
    .controller('DirtRegistrationCtrl', function DirtRegistrationCtrl($scope, Registration) {

        var vm = this;
        vm.propertyExists = Registration.propertyExists;
        vm.reg = Registration.data;

    });
