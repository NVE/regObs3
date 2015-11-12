angular
    .module('RegObs')
    .controller('SnowSurfaceObservationCtrl', function ($scope, $state, Registration) {
        var vm = this;
        vm.propChanged = function (prop){

            var numText = vm[prop];
            var num = parseFloat(numText);

            if(num){
                vm.obs[prop] = (num/100);
            }

            console.log(vm.obs);
        };


        $scope.$on( '$ionicView.loaded', function(){
            vm.obs = Registration.getPropertyAsObject($state.current.data.registrationProp);
            vm.SnowDepth = vm.obs.SnowDepth ? parseInt(vm.obs.SnowDepth*10000)/100 : undefined;
            vm.NewSnowDepth24 = vm.obs.NewSnowDepth24 ? parseInt(vm.obs.NewSnowDepth24*10000)/100 : undefined;
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

