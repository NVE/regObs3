angular
    .module('RegObs')
    .component('mapMenu', {
        templateUrl: 'app/directives/mapmenu/mapmenu.html',
        controller: function (AppSettings, $state, OfflineMap, $cordovaInAppBrowser, $scope, Utility) {
            'ngInject';
            var ctrl = this;
           
            ctrl.opacityArray = [{ name: 'Heldekkende', value: 1.0 }, { name: '75% synlig', value: 0.75 }, { name: '50% synlig', value: 0.50 }, { name: '25% synlig', value: 0.25 }];
            ctrl.daysBackArray = [{ name: '1 dag tilbake i tid', value: 1 }, { name: '2 dager tilbake i tid', value: 2 }, { name: '3 dager tilbake i tid', value: 3 }, { name: '1 uke tilbake i tid', value: 7 }, { name: '2 uker tilbake i tid', value: 14 }];

            ctrl.onSettingsChanged = function() {
                AppSettings.save();
            };

            ctrl.downloadMap = function() {
                OfflineMap.getOfflineAreas()
               .then(function (result) {
                   if (result.length > 0) {
                       $state.go('offlinemapoverview');
                   } else {
                       $state.go('mapareadownload');
                   }
               }, function (error) {
                   $state.go('offlinemapoverview');
               });
            };

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

            ctrl.init = function() {
                ctrl.settings = AppSettings.data;
            };

            $scope.$on('$regObs:appReset', function() {
                ctrl.init();
            });

            ctrl.init();
        }
    });