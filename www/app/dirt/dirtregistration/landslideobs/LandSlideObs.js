angular
    .module('RegObs')
    .controller('LandSlideObsCtrl', function ($scope, Registration) {
        function init() {
            var vm = this;
            vm.registrationProp = 'LandSlideObs';
            vm.obs = Registration.getPropertyAsObject(vm.registrationProp);
        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
