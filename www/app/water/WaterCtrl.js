/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .controller('WaterCtrl', function WaterCtrl(AppSettings, $scope, $cordovaInAppBrowser) {

        var vm = this;

        vm.openObservations = function () {
            var url = AppSettings.data.env === 'prod' ? 'http://www.regobs.no/Flood/Observations' : 'http://h-web01.nve.no/stage_regobsweb/Flood/Observations';
            $cordovaInAppBrowser.open(url, '_system' );
        };
        vm.openWarnings = function () {
            $cordovaInAppBrowser.open('http://www.varsom.no/Flom', '_system' );
        };


        $scope.$on( '$ionicView.loaded', function(){} );

    });