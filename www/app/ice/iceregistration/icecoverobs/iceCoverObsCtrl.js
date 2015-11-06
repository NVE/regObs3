angular
    .module('RegObs')
    .controller('IceCoverObsCtrl', function ($scope, Registration) {
        function init(){
            var vm = this;

            vm.registrationProp = 'IceCoverObs';
            vm.iceCoverObs = Registration.getPropertyAsObject(vm.registrationProp);

        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );
    });

