angular
    .module('RegObs')
    .controller('AvalancheActivityObsCtrl', function ($scope, $ionicModal, Registration) {
        var vm = this;



        $scope.$on('$ionicView.loaded', function(){

            if(!vm.reg) vm.reg = Registration.initPropertyAsArray("AvalancheActivityObs2");

        });
    });

