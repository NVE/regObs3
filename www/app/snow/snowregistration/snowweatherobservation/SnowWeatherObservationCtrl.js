angular
    .module('RegObs')
    .controller('SnowWeatherObservationCtrl', function ($scope, $state, Registration) {
        var vm = this;
        vm.windDirectionArray = Registration.getExpositionArray();

        $scope.$on( '$ionicView.loaded', function(){
            vm.obs = Registration.getPropertyAsObject($state.current.data.registrationProp);
        });
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
