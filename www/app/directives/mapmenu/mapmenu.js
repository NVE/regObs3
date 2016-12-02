angular
    .module('RegObs')
    .component('mapMenu', {
        templateUrl: 'app/directives/mapmenu/mapmenu.html',
        controller: function(AppSettings) {
            'ngInject';
            var ctrl = this;

            ctrl.showSteepness = AppSettings.data.showSteepnessMap || true;

            ctrl.onSettingsChanged = function () {
                AppSettings.data.showSteepnessMap = ctrl.showSteepness;
                AppSettings.save();
            }
        }
    });