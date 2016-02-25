angular
    .module('RegObs')
    .controller('IceRegistrationCtrl', function IceRegistrationCtrl($scope, Registration) {

        var vm = this;

        vm.reg = Registration.data;

    });
