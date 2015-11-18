angular
    .module('RegObs')
    .controller('WaterLevelCtrl', function ($scope, $state, Registration) {

        var vm = this;

        vm.resetModel = function () {
            if(vm.reg.WaterLevel.MeasuredDischarge){
                delete vm.reg.WaterLevel.MeasuredDischarge;
            }
            vm.reg.WaterLevel.WaterLevelRefTID = undefined;
        };


        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);
            if(vm.reg.WaterLevel.WaterLevelRefTID < 200 || vm.reg.WaterLevel.MeasuredDischarge){
                vm.choice = 1;
            } else if (vm.reg.WaterLevel.WaterLevelRefTID >= 200){
                vm.choice = 2;
            }
        });
    });
