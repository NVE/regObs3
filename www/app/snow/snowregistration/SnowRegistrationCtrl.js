angular
    .module('RegObs')
    .controller('SnowRegistrationCtrl', function SnowRegistrationCtrl($scope, Registration) {

        var vm = this;


        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.data;
        });

    });

