angular
    .module('RegObs')
    .controller('HelpCtrl', function ($scope, $cordovaInAppBrowser, AppSettings) {
        //var vm = this;
        //vm.openUrl = function (relUrl) {
        //    var base = AppSettings.data.env === 'prod' ? 'https://api.nve.no/hydrology/regobs/v0.9.0/' : 'http://h-web01.nve.no/stage_regobsservices/';
        //    $cordovaInAppBrowser.open(base+relUrl, '_system' );
        //};

        $scope.openExternalUrl = function (url) {
            $cordovaInAppBrowser.open(url, '_system');
        };

        $scope.$on('$ionicView.loaded', function(){});
    });