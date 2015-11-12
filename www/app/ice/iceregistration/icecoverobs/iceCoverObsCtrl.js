
angular
    .module('RegObs')
    .controller('IceCoverObsCtrl', function ($scope, $state, Registration) {
        var vm = this;

        $scope.$on( '$ionicView.loaded', function(){
            vm.obs = Registration.getPropertyAsObject($state.current.data.registrationProp);
        });
    });

