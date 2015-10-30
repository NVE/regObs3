angular
    .module('RegObs')
    .controller('AvalancheEvaluationCtrl', function ($scope, Registration) {
        function init(){
            var vm = this;

            vm.save = Registration.save;

            vm.obs = Registration.getPropertyAsObject('AvalancheEvaluation3');

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
