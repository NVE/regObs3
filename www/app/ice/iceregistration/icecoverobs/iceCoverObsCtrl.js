
angular
    .module('RegObs')
    .controller('IceCoverObsCtrl', function ($scope, $state, Registration) {
        var vm = this;

        $scope.$on( '$ionicView.loaded', function(){
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);
        });
    });

