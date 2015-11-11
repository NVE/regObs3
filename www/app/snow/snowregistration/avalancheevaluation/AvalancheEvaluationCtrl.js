angular
    .module('RegObs')
    .controller('AvalancheEvaluationCtrl', function ($scope, $state, Registration) {
        function init(){
            var vm = this;

            vm.obs = Registration.getPropertyAsObject($state.current.data.registrationType);

        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );
    });

/*
"AvalancheEvaluation3": {
    "AvalancheEvaluation": "Vurdering",
        "AvalancheDevelopment": "Utvikling",
        "AvalancheDangerTID": "3",
        "ForeCastCorrectTID": "2",
        "ForecastComment": "Kommentar"
}*/
