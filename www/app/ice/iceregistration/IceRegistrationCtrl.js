angular
    .module('RegObs')
    .controller('IceRegistrationCtrl', function IceRegistrationCtrl($scope, Registration) {

        var vm = this;

        vm.send = Registration.send;
        vm.remove = Registration.remove;
        vm.obsObjectExists = Registration.propertyObjectExists;
        vm.obsArrayExists = Registration.propertyArrayExists;


    });
