/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .controller('DirtCtrl', function DirtCtrl(AppSettings, $scope, $cordovaInAppBrowser) {

        var vm = this;

        vm.openObservations = function () {
            var url = AppSettings.data.env === 'prod' ? 'http://www.regobs.no/LandSlide/Observations' : 'http://h-web01.nve.no/stage_regobsweb/LandSlide/Observations';
            console.log(url);
            $cordovaInAppBrowser.open(url, '_system' );
        };
        vm.openWarnings = function () {
            $cordovaInAppBrowser.open('http://www.varsom.no/Jordskred', '_system' );
        };

        $scope.$on( '$ionicView.loaded', function(){});

    });