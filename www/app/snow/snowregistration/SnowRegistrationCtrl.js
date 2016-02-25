angular
    .module('RegObs')
    .controller('SnowRegistrationCtrl', function SnowRegistrationCtrl($scope, Registration) {

        var vm = this;

        vm.reg = Registration.data;


        $scope.$on('$ionicView.loaded', function(){

        });

    });

