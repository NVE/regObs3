angular
    .module('RegObs')
    .controller('DirtRegistrationCtrl', function DirtRegistrationCtrl($scope, Registration) {

        var vm = this;

        vm.hasFooter = function () {
            return Registration.showSend();
        };

        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.data;
        });
    });
