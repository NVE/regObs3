angular
    .module('RegObs')
    .controller('DirtRegistrationCtrl', function DirtRegistrationCtrl($scope, Registration) {

        var vm = this;
        vm.send = Registration.send;
        vm.remove = Registration.remove;
        vm.obsObjectExists = Registration.propertyObjectExists;
        vm.obsArrayExists = Registration.propertyArrayExists;

    });
