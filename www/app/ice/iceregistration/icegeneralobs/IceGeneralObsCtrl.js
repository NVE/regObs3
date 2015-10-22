angular
    .module('RegObs')
    .controller('IceGeneralObsCtrl', function ($scope, Utility, Registration) {
        function init() {
            var vm = this;
            vm.generalObservation = Registration.getPropertyAsObject('ice', 'GeneralObservation');
            vm.save = Registration.save;
        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });

var gen = {
    "Registrations": [{
        "Id": "32f78292-14c1-4d4d-1761-cc3d76a40aa8",
        "GeoHazardTID": 70,
        "ObserverGuid": "A9D7E614-2EE4-4589-B490-A36DDB586AF9",
        "ObserverGroupID": null,
        "Email": false,
        "DtObsTime": "2015-10-22T03:00:19.175Z",
        "ObsLocation": {"Latitude": "59,9124788", "Longitude": "10,7622761", "Uncertainty": "20", "UTMSourceTID": "40"},
        "GeneralObservation": {
            "ObsHeader": "Ghjjj",
            "ObsComment": ""
        }
    }]
};