/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .controller('SnowCtrl', function CountiesCtrl($scope, Localization, AppSettings) {
        var vm = this;

        $scope.$on('$ionicView.loaded', function() {

            vm.hazardRatingStyles = AppSettings.hazardRatingStyles;

        });

    });