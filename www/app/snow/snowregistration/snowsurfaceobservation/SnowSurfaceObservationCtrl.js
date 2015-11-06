angular
    .module('RegObs')
    .controller('SnowSurfaceObservationCtrl', function ($scope, Registration) {
        function init(){
            var vm = this;

            vm.registrationProp = 'SnowSurfaceObservation';
            vm.obs = Registration.getPropertyAsObject(vm.registrationProp);

        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );
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

