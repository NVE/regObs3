angular
    .module('RegObs')
    .controller('SnowWeatherObservationCtrl', function ($scope, Registration) {
        function init(){
            var vm = this;

            vm.registrationProp = 'WeatherObservation';
            vm.obs = Registration.getPropertyAsObject(vm.registrationProp);
            vm.windDirectionArray = Registration.getExpositionArray();
            //vm.obs.WindDirection = vm.windDirectionArray[0].val;

        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );
    });

/*
 "WeatherObservation": {
 "PrecipitationTID": "2",
 "AirTemperature": 1.1,
 "WindSpeed": 2.2,
 "WindDirection": "135",
 "CloudCover": "23",
 "Comment": "Kommentar"
 }*/
