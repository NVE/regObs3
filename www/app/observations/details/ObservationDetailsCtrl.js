angular
    .module('RegObs')
    .controller('ObservationDetailsCtrl', function ($stateParams, Utility, $scope, $ionicHistory) {
        var vm = this;
        vm.observation = $stateParams.observation;
        vm.getHazardName = Utility.geoHazardNames(this.observation.GeoHazardTid);


        $scope.$on('$ionicView.enter', function () {
            var history = $ionicHistory.backView();
            if (history && history.stateName === 'registrationstatus') {
                Utility.setBackView('start'); //Do not go back to registration status (send confirmation)
            }
        });
    });