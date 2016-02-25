angular
    .module('RegObs')
    .controller('DirtRegistrationCtrl', function DirtRegistrationCtrl($scope, Registration) {

        var vm = this;
        vm.reg = Registration.data;

    });
