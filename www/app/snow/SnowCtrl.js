/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .controller('SnowCtrl', function SnowCtrl(AppSettings, $scope, $cordovaInAppBrowser) {

        var vm = this;

        vm.openObservations = function () {
            var url = AppSettings.getObservationsUrl('Avalanche');
            $cordovaInAppBrowser.open(url, '_system' );
        };
        vm.openWarnings = function () {
            $cordovaInAppBrowser.open('http://www.varsom.no/Snoskred', '_system' );
        };

        $scope.$on( '$ionicView.loaded', function(){} );


    });