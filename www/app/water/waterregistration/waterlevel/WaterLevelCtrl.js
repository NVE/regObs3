angular
    .module('RegObs')
    .controller('WaterLevelCtrl', function ($scope, $state, Registration) {
        function init() {
            var vm = this;
            vm.obs = Registration.getPropertyAsObject($state.current.data.registrationType);
            if(vm.obs.WaterLevelRefTID < 200 || vm.obs.MeasuredDischarge){
                vm.choice = 1;
            } else if (vm.obs.WaterLevelRefTID >= 200){
                vm.choice = 2;
            }

            vm.resetModel = function () {
                if(vm.obs.MeasuredDischarge){
                    delete vm.obs.MeasuredDischarge;
                }
                vm.obs.WaterLevelRefTID = undefined;
            };

        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
