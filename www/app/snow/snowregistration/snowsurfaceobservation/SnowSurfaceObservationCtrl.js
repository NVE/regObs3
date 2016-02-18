angular
    .module('RegObs')
    .controller('SnowSurfaceObservationCtrl', function ($scope, $state, Utility, Registration) {
        var vm = this;
        vm.propChanged = function (prop){

            var numText = vm[prop];
            var num = parseFloat(numText);

            if(num){
                vm.reg.SnowSurfaceObservation[prop] = Utility.nDecimal(num/100, 5);
            }

            console.log(vm.reg.SnowSurfaceObservation);
        };


        $scope.$on( '$ionicView.loaded', function(){
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);
            vm.SnowDepth = vm.reg.SnowSurfaceObservation.SnowDepth ? Utility.twoDecimal(vm.reg.SnowSurfaceObservation.SnowDepth*100) : undefined;
            vm.NewSnowDepth24 = vm.reg.SnowSurfaceObservation.NewSnowDepth24 ? Utility.twoDecimal(vm.reg.SnowSurfaceObservation.NewSnowDepth24*100) : undefined;
        });
    });

/*"SnowSurfaceObservation": {
    "SnowDepth": "0.0100",
        "NewSnowDepth24": "0.0200",
        "NewSnowLine": "3",
        "SnowLine": "4",
        "HeightLimitLayeredSnow": "5",
        "SnowDriftTID": "2",
        "Comment": "Kommentar "
}*/

