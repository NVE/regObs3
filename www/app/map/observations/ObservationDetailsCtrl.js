angular
    .module('RegObs')
    .controller('ObservationDetailsCtrl', function ($stateParams, $ionicLoading, Observations, AppLogging) {
        var vm = this;

        vm.options = {
            loop: false
        };

        vm.observation = $stateParams.observation;

        var init = function () {
            $ionicLoading.show();
            Observations.getRegistrationDetails(vm.observation.Registrations[0].RegistrationTid)
                .then(function (success) {
                    vm.registration = success;
                })
                .catch(function (error) {
                    AppLogging.log('Could not get registration details ' + JSON.stringify(error));
                }).finally(function () {
                    $ionicLoading.hide();
                });
        };

        init();
    });