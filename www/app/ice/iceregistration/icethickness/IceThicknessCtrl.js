angular
    .module('RegObs')
    .controller('IceThicknessCtrl', function ($scope, $timeout, $state, Utility, Registration, AppLogging) {

        var vm = this;

        $scope.$on('$regObs:beforeSave', function () {
            if (vm.reg.IceThickness) {
                if (vm.SnowDepth >= 0 && vm.SnowDepth <= 10000) {
                    vm.reg.IceThickness.SnowDepth = Utility.nDecimal(vm.SnowDepth / 100, 5);
                } else {
                    vm.reg.IceThickness.SnowDepth = undefined;
                }
                if (vm.SlushSnow >= 0 && vm.SlushSnow <= 10000) {
                    vm.reg.IceThickness.SlushSnow = Utility.nDecimal(vm.SlushSnow / 100, 5);
                } else {
                    vm.reg.IceThickness.SlushSnow = undefined;
                }
            }
        });



        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);

            AppLogging.log(vm.reg.IceThickness);
            vm.SnowDepth = !isNaN(vm.reg.IceThickness.SnowDepth) ? Utility.nDecimal(vm.reg.IceThickness.SnowDepth*100,3) : undefined;
            vm.SlushSnow = !isNaN(vm.reg.IceThickness.SlushSnow) ? Utility.nDecimal(vm.reg.IceThickness.SlushSnow*100,3) : undefined;
            vm.IceThicknessSum = !isNaN(vm.reg.IceThickness.IceThicknessSum) ? Utility.nDecimal(vm.reg.IceThickness.IceThicknessSum*100,3) : undefined;
        });
    });
