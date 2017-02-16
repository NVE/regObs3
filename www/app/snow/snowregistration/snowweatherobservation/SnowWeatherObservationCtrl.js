angular
    .module('RegObs')
    .controller('SnowWeatherObservationCtrl', function ($scope, $state, Registration, Utility) {
        var vm = this;
        vm.windDirectionArray = Utility.getExpositionArray();

        $scope.$on( '$ionicView.loaded', function(){
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);
        });
    });
