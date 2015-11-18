angular
    .module('RegObs')
    .controller('SnowProfileCtrl', function ($scope, $state, Registration) {

        var vm = this;

        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);
            vm.reg.SnowProfile.Comment = 'Snøprofil fra app';
        });
    });
