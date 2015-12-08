(function () {
    'use strict';

    function WaterCtrl($scope, $cordovaInAppBrowser) {

        var vm = this;

        vm.openWarnings = function () {
            $cordovaInAppBrowser.open('http://www.varsom.no/Flom', '_system' );
        };

        $scope.$on( '$ionicView.loaded', function(){} );
    }

    angular
        .module('RegObs')
        .controller('WaterCtrl', WaterCtrl);

})();
