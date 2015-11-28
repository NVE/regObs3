/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .controller('WaterCtrl', function WaterCtrl($scope, $cordovaInAppBrowser) {

        var vm = this;

        vm.openWarnings = function () {
            $cordovaInAppBrowser.open('http://www.varsom.no/Flom', '_system' );
        };


        $scope.$on( '$ionicView.loaded', function(){} );

    });