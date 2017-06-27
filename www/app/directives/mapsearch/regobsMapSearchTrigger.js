angular
    .module('RegObs')
    .component('regobsMapSearchTrigger', {
        templateUrl: 'app/directives/mapsearch/mapsearchtrigger.html',
        controller: function (AppSettings, Utility, MapSearch, $rootScope, $timeout) {
            var ctrl = this;

            ctrl.checkVisisble = function () {
                $timeout(function () {
                    ctrl.isVisible = !MapSearch.isVisible();
                });
            };

            ctrl.toggle = function () {
                MapSearch.showSearchBar();
            };

            ctrl.checkVisisble();

            $rootScope.$on('regobs:searchBarVisibleChange', ctrl.checkVisisble);
        }
    });