angular
    .module('RegObs')
    .controller('AvalancheEvaluationCtrl', function ($scope, Registration) {
        function init(){
            var vm = this;

            vm.registrationProp = 'AvalancheEvaluation3';
            vm.obs = Registration.getPropertyAsObject(vm.registrationProp);

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
