angular
    .module('RegObs')
    .controller('SnowRegistrationCtrl', function SnowRegistrationCtrl($scope, Registration, $ionicHistory) {

        var vm = this;


        $scope.$on('$ionicView.loaded', function () {
            $ionicHistory.clearHistory();
            vm.reg = Registration.data;
        });

    });

