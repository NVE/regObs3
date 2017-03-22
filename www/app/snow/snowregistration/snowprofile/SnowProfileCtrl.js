angular
    .module('RegObs')
    .controller('SnowProfileCtrl', function ($scope, $state, Registration) {

        var vm = this;

        $scope.$on('$ionicView.loaded', function () {
            vm._prop = $state.current.data.registrationProp;
            vm.reg = Registration.initPropertyAsObject(vm._prop);
        });

        $scope.$on('$ionicView.beforeLeave', function () {
            if (Registration.hasImageForRegistration(vm._prop)) {
                vm.reg[vm._prop].Comment = 'Snøprofil fra app';
            }
        });
    });
