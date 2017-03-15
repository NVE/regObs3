angular
    .module('RegObs')
    .controller('SnowRegistrationCtrl', function SnowRegistrationCtrl($scope, Registration, $ionicHistory, $state) {

        var vm = this;

        vm.hasFooter = function () {
            return Registration.showSend();
        };

        $scope.$on('$ionicView.loaded', function () {
            //$ionicHistory.clearHistory();
            vm.reg = Registration.data;
        });
    });

