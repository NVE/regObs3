angular
    .module('RegObs')
    .controller('SettingsViewCtrl', function ($scope, $timeout, $rootScope, $http, $state, $cordovaInAppBrowser, $ionicLoading, AppSettings, LocalStorage, ObsLocation, Registration, User, Utility, HeaderColor, RegobsPopup, AppLogging, PresistentStorage, OfflineMap, Map, $ionicScrollDelegate) {
        var vm = this;

        vm.settings = AppSettings;
        vm.userService = User;
        vm.showAdvancedSettings = false;

        vm.toggleAdvancedSettings = function() {
            vm.showAdvancedSettings = !vm.showAdvancedSettings;
            $ionicScrollDelegate.resize();
        };

        vm.hasObserverGroups = function () {
            var group = User.getUser().ObserverGroup;
            return group && angular.isArray(group) && group.length > 0;
        };

        vm.kdvUpdated = kdvUpdatedTime(null, LocalStorage.get('kdvUpdated'));

        $http.get('app/json/version.json')
            .then(function (res) {
                AppLogging.log(res);
                vm.version = res.data;
            });

        $scope.$on('kdvUpdated', kdvUpdatedTime);

        function kdvUpdatedTime(event, newDate) {
            $timeout(function () {
                if (newDate) {
                    vm.kdvUpdated = moment(parseInt(newDate)).format('DD.MM, [kl.] HH:mm');
                } else {
                    vm.kdvUpdated = '';
                }
            });
            AppLogging.log('KDV UPDATE', newDate);
        }

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
            var base = AppSettings.getEndPoints().services;
            $cordovaInAppBrowser.open(base + relUrl, '_system');
        };

        vm.clearAppStorage = function () {
            RegobsPopup.delete('Nullstill app?', 'Vil du slette lokalt lagret data og nullstille appen?', 'Nullstill').then(
                function (res) {
                    if (res) {
                        $ionicLoading.show();
                        LocalStorage.clear();
                        PresistentStorage.removeRecursively(AppSettings.imageRootFolder)
                        .catch(function (error) {
                            AppLogging.log('Could not clear presistant storage for folder: ' + AppSettings.imageRootFolder +' ' + JSON.stringify(error));
                        })
                        .then(function () {
                            return PresistentStorage.removeRecursively(AppSettings.registrationRootFolder);
                        }).catch(function (error) {
                            AppLogging.log('Could not clear presistant storage for folder: ' + AppSettings.registrationRootFolder + ' ' + JSON.stringify(error));
                        })
                        .then(function () {
                            return OfflineMap.deleteAllOfflineAreas();
                        })
                        .catch(function (error) {
                            AppLogging.log('Could not delete offline areas. ' + JSON.stringify(error));
                        })
                        .then(function () {
                            AppSettings.load();
                            User.load();
                            HeaderColor.init();
                            Map.refresh();
                            vm.username = '';
                            vm.password = '';
                            $ionicLoading.hide();
                            $rootScope.$broadcast('$regObs:appReset');
                            $state.go('wizard');
                        });
                    }
                });
        };

        vm.refreshKdvElements = function () {
            vm.refreshingKdv = true;
            Utility.refreshKdvElements()
                .then(function () {
                    RegobsPopup.alert('Suksess!', 'Nedtrekkslister har blitt oppdatert.');
                })
                .catch(function () {
                    RegobsPopup.alert('Det oppsto en feil', 'Det oppsto en feil ved oppdatering av nedtrekksmenyer. Vennligst prøv igjen senere');
                })
                .finally(function () {
                    vm.refreshingKdv = false;
                    vm.kdvUpdated = new Date(parseInt(LocalStorage.get('kdvUpdated')));
                    AppLogging.log(vm.kdvUpdated);
                });

        };

        vm.envChanged = function () {
            vm.logOut();
            AppSettings.save();
            HeaderColor.init();
            Map.refresh();
            $rootScope.$broadcast('$regObs:appEnvChanged');
        };

    });
