
angular
    .module('RegObs')
    .controller('IceCoverObsCtrl', function ($scope, $state, Registration) {
        function init(){
            var vm = this;

            vm.obs = Registration.getPropertyAsObject($state.current.data.registrationType);

        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );
    });

