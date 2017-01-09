angular
    .module('RegObs')
    .controller('SnowRegistrationCtrl', function SnowRegistrationCtrl($scope, Registration, $ionicHistory, $state) {

        var vm = this;


        $scope.$on('$ionicView.loaded', function () {
            $ionicHistory.clearHistory();
            vm.reg = Registration.data;
        });

        $scope.$on('$regobs.appModeChanged', Registration.createAndGoToNewRegistration);

    });

