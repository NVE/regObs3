/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .controller('IceCtrl', function IceCtrl(AppSettings, $scope, $cordovaInAppBrowser) {

        var vm = this;

        vm.openObservations = function () {
            var url = AppSettings.data.env === 'prod' ? 'http://www.regobs.no/Ice/Observations' : 'http://h-web01.nve.no/stage_regobsweb/Ice/Observations';
            $cordovaInAppBrowser.open(url, '_system' );
        };
        vm.openWarnings = function () {
            $cordovaInAppBrowser.open('http://www.varsom.no/Isvarsel', '_system' );
        };

    });