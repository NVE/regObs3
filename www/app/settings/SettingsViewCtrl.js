angular
    .module('RegObs')
    .controller('SettingsViewCtrl', function ($scope, $cordovaInAppBrowser, AppSettings, LocalStorage, ObsLocation, Registration, User, HeaderColor, RegobsPopup) {
        var vm = this;

        vm.settings = AppSettings;
        vm.userService = User;

        vm.logIn = function () {
            User.logIn(vm.username, vm.password);
        };

        vm.logOut = function () {
            vm.username = '';
            vm.password = '';
            User.logOut();
            //vm.user = User.getUser();
        };

        vm.openUrl = function (relUrl) {
            var base = AppSettings.data.env === 'prod' ? 'https://api.nve.no/hydrology/regobs/v0.9.0/' : 'http://h-web01.nve.no/stage_regobsservices/';
            $cordovaInAppBrowser.open(base+relUrl, '_system' );
        };

        vm.clearAppStorage = function () {
            RegobsPopup.delete('Nullstill app?', 'Vil du slette lokalt lagret data og nullstille appen?', 'Nullstill').then(
                function(res) {
                    if(res) {
                        LocalStorage.clear();
                        Registration.load();
                        AppSettings.load();                        
                        User.load();
                        HeaderColor.init();
                        vm.username = '';
                        vm.password = '';
                    }
                });
        };

        vm.envChanged = function () {
            vm.logOut();
            AppSettings.save();
            HeaderColor.init();
        };

        $scope.$on('$ionicView.loaded', function(){});
    });
