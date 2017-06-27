angular
    .module('RegObs')
    .controller('LoginViewCtrl', function ($scope, $timeout, $rootScope, $http, $state, $cordovaInAppBrowser, $ionicLoading, AppSettings, LocalStorage, ObsLocation, Registration, User, Utility, HeaderColor, RegobsPopup, AppLogging, PresistentStorage, OfflineMap, Map, $ionicScrollDelegate, HelpTexts) {
        var vm = this;

        vm.settings = AppSettings;
        vm.userService = User;

        vm.logIn = function () {
            User.logIn(vm.username, vm.password).then(function () {
                Utility.configureRaven();
            });
        };

        vm.logOut = function () {
            vm.username = '';
            vm.password = '';
            User.logOut();    
            Utility.configureRaven();
        };

        vm.openUrl = function (relUrl) {
            var base = AppSettings.getEndPoints().services;
            $cordovaInAppBrowser.open(base + relUrl, '_system');
        };
    });
