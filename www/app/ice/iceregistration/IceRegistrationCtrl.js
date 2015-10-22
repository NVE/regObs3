angular
    .module('RegObs')
    .controller('IceRegistrationCtrl', function IceRegistrationCtrl($scope, $ionicHistory, $ionicPopup, Registration, IceRegistration) {

        function init() {

            var vm = this;
            var type = 'ice';

            vm.registration = Registration.registrations[type];

            var showConfirm = function () {
                return $ionicPopup.confirm({
                    title: 'Slett observasjoner',
                    template: 'Er du sikker på at du vil slette lokalt lagrede isobservasjoner?',
                    buttons: [
                        {text: 'Avbryt'},
                        {
                            text: 'Slett',
                            type: 'button-assertive',
                            onTap: function (e) {
                                // Returning a value will cause the promise to resolve with the given value.
                                return true;
                            }
                        }
                    ]
                });
            };

            vm.sendRegistration = function () {
                Registration.sendRegistration(type)
                    .then(function (newRegistration) {
                        vm.registration = newRegistration;
                    });
            };

            vm.deleteRegistration = function () {
                showConfirm()
                    .then(function (response) {
                        if (response) {
                            vm.registration = Registration.deleteRegistration(type);
                            console.log(vm.registration);
                        }
                    });
            };

            vm.iceObjectExists = function (key) {
                return vm.registration[key] && Object.keys(vm.registration[key]).length
            };

            /*vm.dangerObsClicked = function () {
             if (!angular.isArray(IceRegistration.registration.DangerObs) || !IceRegistration.registration.DangerObs.length) {
             $ionicHistory.nextViewOptions({
             disableAnimate: true
             });
             }
             };*/
        }

        $scope.$on('$ionicView.loaded', init.bind(this));

    });
