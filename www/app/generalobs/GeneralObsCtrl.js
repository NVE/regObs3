angular
    .module('RegObs')
    .controller('GeneralObsCtrl', function ($scope, $state, Registration) {
        function init() {
            var vm = this;
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);
        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
