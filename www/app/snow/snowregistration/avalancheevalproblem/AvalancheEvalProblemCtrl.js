angular
    .module('RegObs')
    .controller('AvalancheEvalProblemCtrl', function ($scope, Registration) {
        function init(){
            var vm = this;

            vm.registrationProp = 'AvalancheEvalProblem2';
            vm.obs = Registration.getPropertyAsObject(vm.registrationProp);

        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );
    });