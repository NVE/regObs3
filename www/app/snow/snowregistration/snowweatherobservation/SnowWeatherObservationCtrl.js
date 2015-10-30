angular
    .module('RegObs')
    .controller('SnowWeatherObservationCtrl', function ($scope, Registration) {
        function init(){
            var vm = this;

            vm.save = Registration.save;

            vm.obs = Registration.getPropertyAsObject('WeatherObservation');
            vm.windDirectionArray = [
                {"val" : -1, "name" : "Ikke gitt" },
                {"val" : 0, "name" : "N - nordlig" },
                {"val": 45, "name": "NØ - nordøstlig"},
                {"val": 90, "name": "Ø - østlig"},
                {"val": 135, "name": "SØ - sørøstlig"},
                {"val": 180, "name": "S - sørlig"},
                {"val": 225, "name": "SV - sørvestlig"},
                {"val": 270, "name": "V - vestlig"},
                {"val": 315, "name": "NV - nordvestlig"}
            ];
            vm.obs.WindDirection = vm.windDirectionArray[0].val;

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
