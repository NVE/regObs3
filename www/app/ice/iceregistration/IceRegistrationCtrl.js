angular
    .module('RegObs')
    .controller('IceRegistrationCtrl', function IceRegistrationCtrl($scope, Registration) {

        function init() {

            var vm = this;

            vm.sendRegistration = function () {
                Registration.sendRegistration();
            };

            vm.deleteRegistration = function () {
                Registration.deleteRegistration();
            };

            vm.iceObjectExists = function (key) {
                return Registration.registration[key] && Object.keys(Registration.registration[key]).length
            };

            vm.dangerObsExists = function () {
                return Registration.registration.DangerObs && Registration.registration.DangerObs.length;
            };
        }

        $scope.$on('$ionicView.loaded', init.bind(this));

    });
