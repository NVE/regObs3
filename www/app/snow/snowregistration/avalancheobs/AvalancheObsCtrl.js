angular
    .module('RegObs')
    .controller('AvalancheObsCtrl', function ($scope, Registration) {
        var vm = this;


        $scope.$on('$ionicView.loaded', function(){
            var arr = [
                {
                    "EstimatedNumTID":"3",
                    "DtStart":"2015-11-09T22:37:00.000Z",
                    "DtEnd":"2015-11-09T23:37:00.000Z",
                    "ValidExposition":"11100001",
                    "ExposedHeight1":2100,
                    "ExposedHeight2":1500,
                    "ExposedHeightComboTID":4,
                    "AvalancheExtTID":"20",
                    "AvalCauseTID":"12",
                    "AvalTriggerSimpleTID":"21",
                    "DestructiveSizeTID":"4",
                    "AvalPropagationTID":"0",
                    "Comment":"test"
                }
            ];


            vm.reg = Registration.initPropertyAsObject("AvalancheActivityObs2");

        });
    });
/*
//Ingen skred
var shiz3 = {
    "Registrations": [{
        "Id": "90d5a191-3a26-48cc-f781-c6285947fd06",
        "GeoHazardTID": 10,
        "ObserverGuid": "A9D7E614-2EE4-4589-B490-A36DDB586AF9",
        "ObserverGroupID": null,
        "Email": false,
        "DtObsTime": "2015-10-26T12:19:24.281Z",
        "ObsLocation": {"Latitude": "59,9124788", "Longitude": "10,7623423", "Uncertainty": "20", "UTMSourceTID": "40"},
        "AvalancheActivityObs": [{
            "HeigthStartZone": 0,
            "DtAvalancheTime": "2015-10-26T12:18:06.079Z",
            "EstimatedNumTID": 1,
            "DestructiveSizeTID": 0,
            "AvalancheTID": 0,
            "Comment": "Kommentar "
        }]
    }]
};
//Flere skkred
var shiz = {
    "Registrations": [{
        "Id": "aa9ff5bf-0102-43e7-a7d7-f991107ab515",
        "GeoHazardTID": 10,
        "ObserverGuid": "A9D7E614-2EE4-4589-B490-A36DDB586AF9",
        "ObserverGroupID": null,
        "Email": false,
        "DtObsTime": "2015-10-26T11:42:20.746Z",
        "ObsLocation": {"Latitude": "59,912484", "Longitude": "10,7622841", "Uncertainty": "20", "UTMSourceTID": "40"},
        "AvalancheActivityObs": [{
            "HeigthStartZone": "300",
            "DtAvalancheTime": "2015-10-26T11:42:00.287Z",
            "EstimatedNumTID": "3",
            "DestructiveSizeTID": "4",
            "AvalancheTID": "21",
            "Comment": "Kommentqr"
        }]
    }]
};
//Ett skred
var diz = {
    "Registrations": [{
        "Id": "148d9a9e-a98b-4064-316f-996b3b93f55f",
        "GeoHazardTID": 10,
        "ObserverGuid": "A9D7E614-2EE4-4589-B490-A36DDB586AF9",
        "ObserverGroupID": null,
        "Email": false,
        "DtObsTime": "2015-10-23T14:48:40.957Z",
        "ObsLocation": {"Latitude": "59,9124732", "Longitude": "10,7622124", "Uncertainty": "20", "UTMSourceTID": "40"},
        "Incident": {"IncidentText": "Beskrivelse", "ActivityInfluencedTID": "120", "DamageExtentTID": "30"},
        "AvalancheObs": {
            "DtAvalancheTime": "2015-10-23T16:46",
            "AvalancheTID": "30",
            "DestructiveSizeTID": "4",
            "AvalancheTriggerTID": "23",
            "HeightStartZone": "300",
            "TerrainStartZoneTID": "40",
            "HeightStopZone": "200",
            "Aspect": "180",
            "StartLat": "59,913256524118324",
            "StartLong": "10,76685905456543",
            "StopLat": "59,91876362948221",
            "StopLong": "10,753469467163086",
            "AvalCauseTID": "5",
            "FractureHeight": 23,
            "FractureWidth": 23,
            "Trajectory": "Navn",
            "Comment": "Kommentar "
        }
    }]
};*/
