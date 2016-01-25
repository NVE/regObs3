angular
    .module('RegObs')
    .controller('SettingsViewCtrl', function ($scope, $cordovaInAppBrowser, AppSettings, LocalStorage, ObsLocation, Registration, User, Utility, HeaderColor, RegobsPopup) {
        var vm = this;

        vm.settings = AppSettings;
        vm.userService = User;

        vm.kdvUpdated = new Date(parseInt(LocalStorage.get('kdvUpdated')));



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

        vm.refreshKdvElements = function () {
            vm.refreshingKdv = true;
            Utility.refreshKdvElements()
                .then(function(){
                    RegobsPopup.alert('Suksess!', 'Nedtrekkslister har blitt oppdatert.')
                })
                .catch(function(){
                    RegobsPopup.alert('Det oppsto en feil', 'Det oppsto en feil ved oppdatering av nedtrekksmenyer. Vennligst prøv igjen senere');
                })
                .finally(function(){
                    vm.refreshingKdv = false;
                    vm.kdvUpdated = new Date(parseInt(LocalStorage.get('kdvUpdated')));
                    console.log(vm.kdvUpdated);
                });

        };

        vm.envChanged = function () {
            vm.logOut();
            AppSettings.save();
            HeaderColor.init();
        };

    });
