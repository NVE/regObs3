angular
    .module('RegObs')
    .controller('ConfirmTimeCtrl', function ($scope) {
        var ctrl = this;

        $scope.$on('$ionicView.enter', function () {

            var now = new Date();
            ctrl.time = now;
        });

    });