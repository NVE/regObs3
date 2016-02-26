angular
    .module('RegObs')
    .controller('IceThicknessCtrl', function ($scope, $state, Utility, Registration) {

        var vm = this;

        vm.propChanged = function (prop){
            var num = parseFloat(vm[prop]);
            console.log(vm.reg.IceThickness);
            if(num){
                vm.reg.IceThickness[prop] = Utility.nDecimal(num/100, 5);
            }
        };

        $scope.$watch('vm.reg.IceThickness.IceThicknessSum', function () {
            if(vm.reg.IceThickness)
            vm.IceThicknessSum = vm.reg.IceThickness.IceThicknessSum ? Utility.twoDecimal(vm.reg.IceThickness.IceThicknessSum*100) : undefined;
        });

        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);

            console.log(vm.reg.IceThickness);
            vm.SnowDepth = vm.reg.IceThickness.SnowDepth ? Utility.twoDecimal(vm.reg.IceThickness.SnowDepth*100) : undefined;
            vm.SlushSnow = vm.reg.IceThickness.SlushSnow ? Utility.twoDecimal(vm.reg.IceThickness.SlushSnow*100) : undefined;
            vm.IceThicknessSum = vm.reg.IceThickness.IceThicknessSum ? Utility.twoDecimal(vm.reg.IceThickness.IceThicknessSum*100) : undefined;
        });
    });

