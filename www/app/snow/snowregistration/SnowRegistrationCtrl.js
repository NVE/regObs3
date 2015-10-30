angular
    .module('RegObs')
    .controller('SnowRegistrationCtrl', function SnowRegistrationCtrl($scope, Registration) {

        function init() {

            var vm = this;

            vm.sendRegistration = function () {
                Registration.sendRegistration();
            };

            vm.deleteRegistration = function () {
                Registration.deleteRegistration();
            };

            vm.snowObjectExists = function (key) {
                return Registration.registration[key] && Object.keys(Registration.registration[key]).length
            };

            vm.avalancheObsExists = function () {

                var avalancheObs = Registration.registration.AvalancheObs;
                var avalancheAct = Registration.registration.AvalancheActivityObs;

                return (avalancheAct && avalancheAct.length) || !!(avalancheObs && avalancheObs.DtAvalancheTime);
            };

            vm.dangerObsExists = function () {
                return Registration.registration.DangerObs && Registration.registration.DangerObs.length;
            };

            /*vm.dangerObsClicked = function () {
             if (!angular.isArray(IceRegistration.registration.DangerObs) || !IceRegistration.registration.DangerObs.length) {
             $ionicHistory.nextViewOptions({
             disableAnimate: true
             });
             }
             };*/
        }

        $scope.$on('$ionicView.loaded', init.bind(this));

    });

var shiz = {
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
};
