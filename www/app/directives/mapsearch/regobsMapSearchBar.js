angular
    .module('RegObs')
    .component('regobsMapSearchBar', {
        templateUrl: 'app/directives/mapsearch/mapsearchbar.html',
        controller: function (AppSettings, Utility, $ionicBackdrop, MapSearch, $rootScope, $timeout, $window, Map) {
            var ctrl = this;

            ctrl.checkVisisble = function () {
                $timeout(function () {
                    ctrl.isVisible = MapSearch.isVisible();
                    if (ctrl.isVisible) {
                        $ionicBackdrop.retain();
                        $timeout(function () {
                            var element = $window.document.getElementById('map-search-input');
                            if (element)
                                element.focus();
                        }, 100);
                        

                    } else {
                        $ionicBackdrop.release();
                    }
                });
            };

            ctrl.close = function () {
                ctrl.searchText = '';
                ctrl.searchResults = [];
                MapSearch.hideSearchBar();
            };

            ctrl.searchResults = [];
            
            ctrl.search = function () {
                if (ctrl.searchText && ctrl.searchText.length > 2) {
                    MapSearch.search(ctrl.searchText).then(function (result) {
                        ctrl.searchResults = result;
                    });
                    //ctrl.searchResults = [{ id: 1, name: 'Test', description: 'Desc' }, { id: 2, name: 'Test2', description: 'Desc' }, { id: 3, name: 'Test3', description: 'Desc' }];
                }
            };

            ctrl.goToLocation = function (item) {
                Map.setView(item.latlng);
                ctrl.close();
            };

            ctrl.checkVisisble();

            $rootScope.$on('regobs:searchBarVisibleChange', ctrl.checkVisisble);
        }
    });