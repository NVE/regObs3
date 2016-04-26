(function () {
    'use strict';

    function WaterCtrl(AppSettings, $scope, $cordovaInAppBrowser) {

        var vm = this;

        vm.openWarnings = function () {
            $cordovaInAppBrowser.open('http://www.varsom.no/Flom', '_system' );
        };

        vm.openObservations = function () {
            var url = AppSettings.getObservationsUrl('Flood');
            $cordovaInAppBrowser.open(url, '_system' );
        };

        $scope.$on( '$ionicView.loaded', function(){} );
    }

    angular
        .module('RegObs')
        .controller('WaterCtrl', WaterCtrl);

})();
