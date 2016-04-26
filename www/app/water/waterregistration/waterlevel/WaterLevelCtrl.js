angular
    .module('RegObs')
    .controller('WaterLevelCtrl', function ($scope, $state, Registration) {

        var vm = this;

        var prevChoice;

        vm.resetModel = function () {
            if(!vm.reg.WaterLevelChoice){
                vm.reg.WaterLevelChoice = prevChoice;
            } else {
                prevChoice = vm.reg.WaterLevelChoice;
            }

            if(vm.reg.WaterLevel.MeasuredDischarge){
                delete vm.reg.WaterLevel.MeasuredDischarge;
            }
            delete vm.reg.WaterLevel.WaterLevelRefTID;
        };


        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);

        });
    });
