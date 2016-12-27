angular
    .module('RegObs')
    .controller('ObservationDetailsCtrl', function ($stateParams, $ionicLoading, Observations, AppLogging, $q) {
        var vm = this;

        vm.options = {
            loop: false
        };

        vm.observation = $stateParams.observation;
        vm.registrations = [];

        var getRegistrationDetails = function (id) {
            return $q(function(resolve, reject) {
                Observations.getRegistrationDetails(id)
                    .then(function(success) {
                        vm.registrations.push(success);
                        resolve();
                    })
                    .catch(function(error) {
                        AppLogging.log('Could not get registration details ' + JSON.stringify(error));
                        reject(error);
                    });
            });
        }

        var init = function () {
            $ionicLoading.show();       
            vm.registrations = [];
            var tasks = [];
            vm.observation.Registrations.forEach(function(item) {
                tasks.push(getRegistrationDetails(item.RegistrationTid));
            });

            $q.all(tasks).then(function() {
                $ionicLoading.hide();
            });
        };

        init();
    });