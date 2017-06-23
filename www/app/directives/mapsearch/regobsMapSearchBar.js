angular
    .module('RegObs')
    .component('regobsMapSearchBar', {
        templateUrl: 'app/directives/mapsearch/mapsearchbar.html',
        controller: function (AppSettings, Utility, $ionicBackdrop, MapSearch, $rootScope, $timeout, $window, Map, $ionicScrollDelegate) {
            var ctrl = this;

            ctrl.close = function () {
                ctrl.searchText = '';
                ctrl.searchResults = [];
                MapSearch.hideSearchBar();
            };

            ctrl.searchResults = [];

            ctrl.resetScroll = function () {
                //var scrollHandle = $ionicScrollDelegate.$getByHandle('mapSearchResultScroll');
                var instances = $ionicScrollDelegate.$getByHandle('mapSearchResultScroll')._instances;
                var scrollHandle = instances.filter(function (element) {
                    return (element['$$delegateHandle'] == name);
                })[0];

                if (scrollHandle) {
                    $timeout(function () {
                        scrollHandle.resize();
                        scrollHandle.scrollTop();
                    });
                }
            };
            
            ctrl.search = function () {
                if (ctrl.searchText && ctrl.searchText.length > 1) {
                    ctrl.loading = true;
                    MapSearch.search(ctrl.searchText).then(function (result) {
                        $timeout(function () {
                            ctrl.searchResults = result;
                            ctrl.loading = false;
                            ctrl.resetScroll();
                        });
                    });
                } else {
                    ctrl.searchResults = [];
                    ctrl.resetScroll();
                }
            };

            ctrl.goToLocation = function (item) {
                $timeout(function () {
                    Map.disableFollowMode();
                    Map.flyTo(item.latlng);
                    ctrl.close();
                }, 50); //A small delay to click so user see click effect               
            };
        }
    });