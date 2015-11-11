angular
    .module('RegObs')
    .controller('SnowProfileCtrl', function ($scope, $state, Registration) {

        function init() {
            var vm = this;

            vm.obs = Registration.getPropertyAsObject($state.current.data.registrationType);
            vm.obs.Comment = 'Snøprofil fra app';
        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
