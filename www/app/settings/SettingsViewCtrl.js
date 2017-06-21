angular
    .module('RegObs')
    .controller('SettingsViewCtrl', function ($scope, $timeout, $rootScope, $http, $state, $cordovaInAppBrowser, $ionicLoading, AppSettings, LocalStorage, ObsLocation, Registration, User, Utility, HeaderColor, RegobsPopup, AppLogging, PresistentStorage, OfflineMap, Map, $ionicScrollDelegate, HelpTexts, $ionicHistory) {
        var vm = this;

        vm.settings = AppSettings;
        vm.userService = User;

        vm.kdvUpdated = kdvUpdatedTime(null, LocalStorage.get('kdvUpdated'));

        Utility.getVersion().then(function (result) {
            vm.version = result;
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
                            Registration.load();
                            HeaderColor.init();
                            ObsLocation.init();
                            Map.refresh();
                            $ionicLoading.hide();
                            $ionicHistory.clearCache();
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
                    return HelpTexts.updateHelpTexts();
                }).then(function () {
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
            User.logOut();
            AppSettings.save();
            HeaderColor.init();
            Map.refresh();
            Utility.configureRaven();
            $rootScope.$broadcast('$regObs:appEnvChanged');
        };

    });
