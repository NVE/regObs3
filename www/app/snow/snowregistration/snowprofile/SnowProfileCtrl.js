angular
    .module('RegObs')
    .controller('SnowProfileCtrl', function ($scope, $state, Registration) {

        var vm = this;

        $scope.$on('$ionicView.loaded', function(){
            vm.obs = Registration.getPropertyAsObject($state.current.data.registrationProp);
            vm.obs.Comment = 'Snøprofil fra app';
        });
    });
