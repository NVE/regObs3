angular
    .module('RegObs')
    .controller('IceThicknessCtrl', function ($scope, $state, Utility, Registration) {
        function init() {
            var vm = this;

            vm.propChanged = function (prop){
                var num = parseFloat(vm[prop]);
                console.log(vm.iceThickness);
                if(num){
                    vm.iceThickness[prop] = (num/100);
                }
            };


            vm.iceThickness = Registration.getPropertyAsObject($state.current.data.registrationType);
            vm.SnowDepth = vm.iceThickness.SnowDepth ? parseInt(vm.iceThickness.SnowDepth*10000)/100 : undefined;
            vm.SlushSnow = vm.iceThickness.SlushSnow ? parseInt(vm.iceThickness.SlushSnow*10000)/100 : undefined;
            vm.IceThicknessSum = vm.iceThickness.IceThicknessSum ? parseInt(vm.iceThickness.IceThicknessSum*10000)/100 : undefined;

        }

        $scope.$on('$ionicView.loaded', init.bind(this));
    });

/*
var t = {
    "Registrations": [{
        "Id": "c08c3e0b-dfb3-421f-7965-d0bf0d778c90",
        "GeoHazardTID": 70,
        "ObserverGuid": "A9D7E614-2EE4-4589-B490-A36DDB586AF9",
        "ObserverGroupID": null,
        "Email": false,
        "DtObsTime": "2015-10-19T16:55:36.087Z",
        "ObsLocation": {"Latitude": "59,9124634", "Longitude": "10,7622424", "Uncertainty": "20", "UTMSourceTID": "40"},
        "IceThickness": {
            "IceThicknessLayer": [
                {
                    "IceLayerID": 0, //økende id bare
                    "IceLayerTID": "1", //Sarpe osv
                    "IceLayerThickness": "0.0100"
                }, {
                    "IceLayerID": 1,
                    "IceLayerTID": "9",
                    "IceLayerThickness": "0.0200"
                }
            ],
            "IceThicknessSum": "0.0300", //total istykkelse CM
            "SnowDepth": "0.2300", //tørr snø
            "SlushSnow": "0.4500", //sørpe
            "Comment": "Kommentar"
        }
    }]
}*/
