angular
    .module('RegObs')
    .controller('AvalancheEvaluationCtrl', function ($scope, $state, Registration, Utility) {

        var vm = this;

        $scope.$on('$ionicView.loaded', function () {
            vm._prop = $state.current.data.registrationProp;
            vm.reg = Registration.initPropertyAsObject(vm._prop);
        });

        $scope.$on('$ionicView.beforeLeave', function () {
            var prop = vm.reg[vm._prop];
            if (!Utility.isEmpty(prop) && !prop.AvalancheDangerTID) {
                prop.AvalancheDangerTID = 0; //If anything is registered, but danger is not set, set to 0 - not evaluated
            }
        });
    });
