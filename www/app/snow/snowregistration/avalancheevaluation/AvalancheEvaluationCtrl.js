angular
    .module('RegObs')
    .controller('AvalancheEvaluationCtrl', function ($scope, $state, Registration) {

        var vm = this;

        $scope.$on('$ionicView.loaded', function(){
            vm.obs = Registration.getPropertyAsObject($state.current.data.registrationProp);
        });
    });

/*
"AvalancheEvaluation3": {
    "AvalancheEvaluation": "Vurdering",
        "AvalancheDevelopment": "Utvikling",
        "AvalancheDangerTID": "3",
        "ForeCastCorrectTID": "2",
        "ForecastComment": "Kommentar"
}*/
