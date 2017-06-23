angular
    .module('RegObs')
    .component('mapMenu', {
        templateUrl: 'app/directives/mapmenu/mapmenu.html',
        controller: function (AppSettings, $state, OfflineMap, $cordovaInAppBrowser, $scope, Utility, $rootScope, $ionicSideMenuDelegate, User, RegobsPopup, Registration) {
            'ngInject';
            var ctrl = this;
           
            ctrl.opacityArray = [{ name: 'Heldekkende', value: 1.0 }, { name: '75% synlig', value: 0.75 }, { name: '50% synlig', value: 0.50 }, { name: '25% synlig', value: 0.25 }];

            ctrl.onSettingsChanged = function () {
                if (ctrl.daysBack >= 0 && ctrl.daysBack !== AppSettings.getObservationsDaysBack()) {
                    AppSettings.setObservationsDaysBack(ctrl.daysBack)
                }
                AppSettings.save();
            };
            

            ctrl.downloadMap = function () {
                $ionicSideMenuDelegate.toggleLeft();
                OfflineMap.getOfflineAreas().then(function (result) {
                   if (result.length > 0) {
                       $state.go('offlinemapoverview');
                   } else {
                       $state.go('mapareadownload');
                   }
               }, function (error) {
                   $state.go('offlinemapoverview');
               });
            };

            ctrl.RegistrationService = Registration;


            //Fix because of bug in menu-close and ui-sref on menu item resets back-state and back button is sometimes missing
            ctrl.navigateTo = function (page, options) {
                $ionicSideMenuDelegate.toggleLeft(); 
                $state.go(page, options);
            };

            ctrl.openLegalInfo = RegobsPopup.showLegalInfo;

            ctrl.getMapsForCurrentAppMode = function() {
                return ctrl.settings.maps.filter(function(item) {
                    return item.geoHazardTid === Utility.getCurrentGeoHazardTid();
                });
            };

            ctrl.getTileDescription = function(tile) {
                var t = AppSettings.getTileByName(tile.name);
                if (t) {
                    return t.description;
                }
                return '';
            };

            ctrl.getTileLabel = function(tile) {
                var t = AppSettings.getTileByName(tile.name);
                if (t) {
                    return t.labelTemplate;
                }
                return null;
            };

            ctrl.hasTileLabel = function(tile) {
                return true && ctrl.getTileLabel(tile);
            };

            ctrl.initDaysBackSettings = function () {
                ctrl.daysBack = AppSettings.getObservationsDaysBack();
                ctrl.daysBackArray = AppSettings.getDaysBackArrayForCurrentGeoHazard();
            };

            ctrl.setUser = function () {
                ctrl.user = User.getUser();
            };

            ctrl.init = function() {
                ctrl.settings = AppSettings.data;
                ctrl.initDaysBackSettings();
                ctrl.setUser();
            };

            $scope.$on('$regObs:appReset', function() {
                ctrl.init();
            });

            $scope.$on('$regobs.appModeChanged', function () {
                ctrl.initDaysBackSettings();
            });

            $scope.$on('$regObs:userInfoSaved', function () {
                ctrl.setUser();
            });

            ctrl.$onInit = function () {
                ctrl.init();
            }; 
        }
    });