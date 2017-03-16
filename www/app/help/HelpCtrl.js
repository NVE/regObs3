angular
    .module('RegObs')
    .controller('HelpCtrl', function ($scope, $ionicHistory, AppLogging) {
        var vm = this;

        $scope.$on('$ionicView.loaded', function () {
            AppLogging.log('view history: ' + JSON.stringify($ionicHistory.viewHistory()));
        });
    });