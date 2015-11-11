angular
    .module('RegObs')
    .controller('AvalancheEvalProblemCtrl', function ($scope) {
        function init(){
            var vm = this;

        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );
    });