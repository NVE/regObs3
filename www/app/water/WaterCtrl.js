/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .controller('WaterCtrl', function WaterCtrl($scope, Localization, AppSettings, Registration) {
        var vm = this;

        $scope.$on('$ionicView.loaded', function() {

            vm.hazardRatingStyles = AppSettings.hazardRatingStyles;
            console.log(Registration);

        });

    });