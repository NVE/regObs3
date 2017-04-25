angular
    .module('RegObs')
    .controller('DamageObsCtrl', function ($scope, $state, Registration) {
        var vm = this;

        vm.init = function() {           
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);

            vm.DamageObs = [{ Name: 'Bygninger og eiendeler' }, { Name: 'Infrastruktur' }];
        }

        $scope.$on('$ionicView.loaded', vm.init);
    });