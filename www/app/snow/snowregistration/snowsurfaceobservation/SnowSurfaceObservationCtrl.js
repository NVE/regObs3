angular
    .module('RegObs')
    .controller('SnowSurfaceObservationCtrl', function ($scope, $state, Registration) {
        var vm = this;
        vm.propChanged = function (prop){

            var numText = vm[prop];
            var num = parseFloat(numText);

            if(num){
                vm.reg.SnowSurfaceObservation[prop] = (num/100);
            }

            console.log(vm.reg.SnowSurfaceObservation);
        };


        $scope.$on( '$ionicView.loaded', function(){
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);
            vm.SnowDepth = vm.reg.SnowSurfaceObservation.SnowDepth ? parseInt(vm.reg.SnowSurfaceObservation.SnowDepth*10000)/100 : undefined;
            vm.NewSnowDepth24 = vm.reg.SnowSurfaceObservation.NewSnowDepth24 ? parseInt(vm.reg.SnowSurfaceObservation.NewSnowDepth24*10000)/100 : undefined;
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

