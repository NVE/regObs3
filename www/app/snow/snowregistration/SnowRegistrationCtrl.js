angular
    .module('RegObs')
    .controller('SnowRegistrationCtrl', function SnowRegistrationCtrl($scope, Registration) {

        var vm = this;

        vm.send = Registration.send;
        vm.remove = Registration.remove;
        vm.obsObjectExists = Registration.propertyObjectExists;
        vm.obsArrayExists = Registration.propertyArrayExists;

        vm.avalancheObsExists = function () {

            var avalancheObs = Registration.data.AvalancheObs;
            var avalancheAct = Registration.data.AvalancheActivityObs;

            return (avalancheAct && avalancheAct.length) || !!(avalancheObs && avalancheObs.DtAvalancheTime);
        };


        $scope.$on('$ionicView.loaded', function(){

        });

    });

/*var shiz = {
    "Registrations": [{
        "Id": "9b7a4a75-270c-423a-3336-cf028cf2f4ef",
        "GeoHazardTID": 10,
        "ObserverGuid": "A9D7E614-2EE4-4589-B490-A36DDB586AF9",
        "ObserverGroupID": null,
        "Email": false,
        "DtObsTime": "2015-10-28T09:46:20.828Z",
        "ObsLocation": {"Latitude": "59,9124784", "Longitude": "10,7622767", "Uncertainty": "20", "UTMSourceTID": "40"},
        "AvalancheEvaluation3": {
            "AvalancheEvaluation": "Vurdering",
            "AvalancheDevelopment": "Utvikling",
            "AvalancheDangerTID": "3",
            "ForeCastCorrectTID": "2",
            "ForecastComment": "Kommentar"
        },
        "SnowSurfaceObservation": {
            "SnowDepth": "0.0100",
            "NewSnowDepth24": "0.0200",
            "NewSnowLine": "3",
            "SnowLine": "4",
            "HeightLimitLayeredSnow": "5",
            "SnowDriftTID": "2",
            "Comment": "Kommentar "
        },
        "WeatherObservation": {
            "PrecipitationTID": "2",
            "AirTemperature": 1.1,
            "WindSpeed": 2.2,
            "WindDirection": "135",
            "CloudCover": "23",
            "Comment": "Kommentar"
        }
    }]
};*/
