angular
    .module('RegObs')
    .controller('IceRegistrationCtrl', function IceRegistrationCtrl($scope, Registration) {

        var vm = this;

        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.data;
        });

    });
