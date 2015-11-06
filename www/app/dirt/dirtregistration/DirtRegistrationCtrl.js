angular
    .module('RegObs')
    .controller('DirtRegistrationCtrl', function DirtRegistrationCtrl($scope, Registration) {

        function init() {

            var vm = this;

            vm.sendRegistration = Registration.sendRegistration;
            vm.deleteRegistration = Registration.deleteRegistration;
            vm.obsObjectExists = Registration.propertyObjectExists;
            vm.obsArrayExists = Registration.propertyArrayExists;
        }

        $scope.$on('$ionicView.loaded', init.bind(this));

    });
