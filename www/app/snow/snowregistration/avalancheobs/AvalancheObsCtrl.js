angular
    .module('RegObs')
    .controller('AvalancheObsCtrl', function ($scope, $ionicModal, Registration) {
        var vm = this;

        var now = new Date().toISOString();

        var noAvalanches = [
            {
                "EstimatedNumTID":"1",
                "DtStart": now,
                "DtEnd": now,
                "DestructiveSizeTID":"0",
                "AvalPropagationTID":"0",
                "ExposedHeightComboTID": "0",
                "AvalancheExtTID":"0",
                "AvalCauseTID":"0",
                "AvalTriggerSimpleTID":"0",

                "Comment":""
            }
        ];

        var loadModal = function () {
            var url = 'app/snow/snowregistration/avalancheobs/avalancheMapModal.html';
            return $ionicModal
                .fromTemplateUrl(url, {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    vm.modal = modal;
                    return modal;
                });
        };

        loadModal();

        vm.expoArray = Registration.getExpositionArray();
        vm.heightArray = [
            2500, 2400, 2300, 2200, 2100,
            2000, 1900, 1800, 1700, 1600,
            1500, 1400, 1300, 1200, 1100,
            1000, 900, 800, 700, 600,
            500, 400, 300, 200, 100, 0
        ];


        vm.setLandslideInMap = function () {
            vm.modal.hide();
            $scope.$broadcast('setLandslideInMap');
        };

        vm.openLandslideInMap = function () {
            vm.modal.show();
            $scope.$broadcast('openLandslideInMap');
        };

        $scope.$watch('vm.reg.avalChoice', function(newValue, oldValue) {
            if(oldValue !== newValue) {
                if (newValue === 0) {
                    delete vm.reg.AvalancheObs;
                    delete vm.reg.Incident;
                    vm.reg = Registration.initPropertyAsArray("AvalancheActivityObs2");
                    vm.reg.AvalancheActivityObs2 = angular.copy(noAvalanches);

                } else if (newValue === 1) {
                    delete vm.reg.AvalancheActivityObs2;
                    vm.reg = Registration.initPropertyAsObject("AvalancheObs");
                } else if (newValue === 2) {
                    delete vm.reg.AvalancheObs;
                    delete vm.reg.Incident;
                    delete vm.reg.AvalancheActivityObs2;
                    vm.reg = Registration.initPropertyAsArray("AvalancheActivityObs2");
                }
            }
        });


        $scope.$on('$ionicView.loaded', function(){

            if(!vm.reg) vm.reg = Registration.initPropertyAsObject("AvalancheObs");

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
