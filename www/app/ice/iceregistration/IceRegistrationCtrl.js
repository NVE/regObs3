angular
    .module('RegObs')
    .controller('IceRegistrationCtrl', function IceRegistrationCtrl($scope, $ionicHistory, $ionicPopup, IceRegistration) {

        function init() {

            var vm = this;

            vm.registration = IceRegistration.registration;

            var showConfirm = function() {
                return $ionicPopup.confirm({
                    title: 'Slett observasjoner',
                    template: 'Er du sikker på at du vil slette lokalt lagrede isobservasjoner?',
                    buttons: [
                        { text: 'Avbryt' },
                        {
                            text: 'Slett',
                            type: 'button-assertive',
                            onTap: function(e) {
                                // Returning a value will cause the promise to resolve with the given value.
                                return true;
                            }
                        }
                    ]
                }).then(function(res) {
                    return res;
                });
            };

            vm.sendRegistration = function () {
                IceRegistration.sendRegistration();
                vm.registration = IceRegistration.registration;
            };

            vm.deleteRegistration = function () {
                showConfirm()
                    .then(function(response){
                        if(response){
                            IceRegistration.deleteRegistration();
                            vm.registration = IceRegistration.registration;
                            console.log(vm.registration);
                        }
                    });
            };

            vm.iceCoverExists = function () {
                return vm.registration.IceCoverObs && Object.keys(vm.registration.IceCoverObs).length
            };

            /*vm.dangerObsClicked = function () {
               if (!angular.isArray(IceRegistration.registration.DangerObs) || !IceRegistration.registration.DangerObs.length) {
                    $ionicHistory.nextViewOptions({
                        disableAnimate: true
                    });
                }
            };*/
        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );

    });
