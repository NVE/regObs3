angular
    .module('RegObs')
    .controller('IceRegistrationCtrl', function IceRegistrationCtrl($scope, Registration) {

        var vm = this;

        vm.hasFooter = function () {
            return Registration.showSend();
        };

        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.data;
        });
    });
