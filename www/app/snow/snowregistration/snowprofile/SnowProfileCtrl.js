angular
    .module('RegObs')
    .controller('SnowProfileCtrl', function ($scope, Registration) {

        function init() {
            var vm = this;
            vm.registrationProp = 'SnowProfile';
            vm.obs = Registration.getPropertyAsObject(vm.registrationProp);
            vm.obs.Comment = 'Snøprofil fra app';
        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
