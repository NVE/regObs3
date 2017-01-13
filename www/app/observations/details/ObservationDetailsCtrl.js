angular
    .module('RegObs')
    .controller('ObservationDetailsCtrl', function ($stateParams) {
        var vm = this;
        vm.observation = $stateParams.observation;
    });