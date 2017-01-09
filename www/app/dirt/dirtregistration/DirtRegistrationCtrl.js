angular
    .module('RegObs')
    .controller('DirtRegistrationCtrl', function DirtRegistrationCtrl($scope, Registration) {

        var vm = this;
        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.data;
        });

        $scope.$on('$regobs.appModeChanged', Registration.createAndGoToNewRegistration);
    });
