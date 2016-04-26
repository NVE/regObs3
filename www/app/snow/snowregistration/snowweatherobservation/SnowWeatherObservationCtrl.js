angular
    .module('RegObs')
    .controller('SnowWeatherObservationCtrl', function ($scope, $state, Registration) {
        var vm = this;
        vm.windDirectionArray = Registration.getExpositionArray();

        $scope.$on( '$ionicView.loaded', function(){
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);
        });
    });
