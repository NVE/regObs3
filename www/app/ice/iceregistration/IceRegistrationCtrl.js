angular
    .module('RegObs')
    .controller('IceRegistrationCtrl', function IceRegistrationCtrl($scope, Registration) {

        function init() {

            var vm = this;
            var type = 'ice';

            vm.sendRegistration = function () {
                Registration.sendRegistration(type);
            };

            vm.deleteRegistration = function () {
                Registration.deleteRegistration(type);
            };

            vm.iceObjectExists = function (key) {
                return Registration.registrations[type][key] && Object.keys(Registration.registrations[type][key]).length
            };

            vm.dangerObsExists = function () {
                return Registration.registrations[type].DangerObs && Registration.registrations[type].DangerObs.length;
            };
        }

        $scope.$on('$ionicView.loaded', init.bind(this));

    });
