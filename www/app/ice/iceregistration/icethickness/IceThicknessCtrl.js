angular
    .module('RegObs')
    .controller('IceThicknessCtrl', function ($scope, $timeout, $state, Utility, Registration) {

        var vm = this;

        vm.propChanged = function (prop){
            $timeout(function(){
                var num = parseFloat(vm[prop]);

                if(!isNaN(num)){
                    console.log(num);
                    vm.reg.IceThickness[prop] = Utility.nDecimal(num/100, 5);

                    console.log('IceThicknessSum', vm.IceThicknessSum);
                }
            });
        };


        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);

            console.log(vm.reg.IceThickness);
            vm.SnowDepth = !isNaN(vm.reg.IceThickness.SnowDepth) ? Utility.nDecimal(vm.reg.IceThickness.SnowDepth*100,3) : undefined;
            vm.SlushSnow = !isNaN(vm.reg.IceThickness.SlushSnow) ? Utility.nDecimal(vm.reg.IceThickness.SlushSnow*100,3) : undefined;
            vm.IceThicknessSum = !isNaN(vm.reg.IceThickness.IceThicknessSum) ? Utility.nDecimal(vm.reg.IceThickness.IceThicknessSum*100,3) : undefined;
        });
    });
