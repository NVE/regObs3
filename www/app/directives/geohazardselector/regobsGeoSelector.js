angular
    .module('RegObs')
    .component('regobsGeoSelector', {
        templateUrl: 'app/directives/geohazardselector/geohazardselector.html',
        bindings: {
            readOnly: '<'
        },
        controller: function (AppSettings, Utility) {
            'ngInject';
            var ctrl = this;
            ctrl.isOpen = false;
            ctrl.toggle = function () {
                ctrl.isOpen = !ctrl.isOpen;
            };

            ctrl.getCurrentAppMode = function () {
                return AppSettings.getAppMode();
            };

            ctrl.changeAppMode = function (mode) {
                AppSettings.setAppMode(mode);
                ctrl.isOpen = false;
            };

            ctrl.geoHazardTypes = [];
            var types = Utility.getGeoHazardTypes();
            for (var propertyName in types) {
                var id = types[propertyName];
                ctrl.geoHazardTypes.push({ id: id, name: propertyName });
            };
        }
    });