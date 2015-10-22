angular
    .module('RegObs')
    .controller('IceIncidentCtrl', function ($scope, Utility, Registration) {
        function init() {
            var vm = this;

            vm.save = Registration.save;

            vm.incident = Registration.getPropertyAsObject('ice', 'Incident');

        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });

var p = {
    "Registrations": [{
        "Id": "cd7ad5f9-3f85-4e40-2331-c3c9200c4305",
        "GeoHazardTID": 70,
        "ObserverGuid": "A9D7E614-2EE4-4589-B490-A36DDB586AF9",
        "ObserverGroupID": null,
        "Email": false,
        "DtObsTime": "2015-10-22T02:55:38.573Z",
        "ObsLocation": {"Latitude": "59,9124805", "Longitude": "10,7622307", "Uncertainty": "20", "UTMSourceTID": "40"},
        "Incident": {
            "IncidentText": "Gdhdh",
            "ActivityInfluencedTID": "720",
            "DamageExtentTID": "29"
        }
    }]
};