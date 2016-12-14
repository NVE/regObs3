angular
    .module('RegObs')
    .component('mapMenu', {
        templateUrl: 'app/directives/mapmenu/mapmenu.html',
        controller: function (AppSettings, $state, OfflineMap) {
            'ngInject';
            var ctrl = this;

            ctrl.settings = AppSettings.data;
            ctrl.opacityArray = [{ name: 'Heldekkende', value: 1.0 }, { name: '75% gjennomsiktig', value: 0.75 }, { name: '50% gjennomsiktig', value: 0.50 }, { name: '25% gjennomsiktig', value: 0.25 }];
            ctrl.daysBackArray = [{ name: '1 dag tilbake i tid', value: 1 }, { name: '2 dager tilbake i tid', value: 2 }, { name: '3 dager tilbake i tid', value: 3 }, { name: '4 dager tilbake i tid', value: 4 }, { name: '5 dager tilbake i tid', value: 5 }, { name: '6 dager tilbake i tid', value: 6 }, { name: '7 dager tilbake i tid', value: 7 }];

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
        }
    });