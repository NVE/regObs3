angular
    .module('RegObs')
    .controller('SnowSurfaceObservationCtrl', function ($scope, $state, $timeout, Utility, Registration, AppLogging) {
        var vm = this;

        $scope.$on('$regObs:beforeSave', function () {
            if (vm.reg.SnowSurfaceObservation) {
                if (vm.SnowDepth >= 0 && vm.SnowDepth <= 1000) {
                    vm.reg.SnowSurfaceObservation.SnowDepth = Utility.nDecimal(vm.SnowDepth / 100, 5);
                } else {
                    vm.reg.SnowSurfaceObservation.SnowDepth = undefined;
                }
                if (vm.NewSnowDepth24 >= 0 && vm.NewSnowDepth24 <= 1000) {
                    vm.reg.SnowSurfaceObservation.NewSnowDepth24 = Utility.nDecimal(vm.NewSnowDepth24 / 100, 5);
                } else {
                    vm.reg.SnowSurfaceObservation.NewSnowDepth24 = undefined;
                }
            }
        });


        $scope.$on('$ionicView.loaded', function () {
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);
            vm.SnowDepth = vm.reg.SnowSurfaceObservation.SnowDepth ? Utility.twoDecimal(vm.reg.SnowSurfaceObservation.SnowDepth * 100) : undefined;
            vm.NewSnowDepth24 = vm.reg.SnowSurfaceObservation.NewSnowDepth24 ? Utility.twoDecimal(vm.reg.SnowSurfaceObservation.NewSnowDepth24 * 100) : undefined;
        });
    });
