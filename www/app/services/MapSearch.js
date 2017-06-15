angular
    .module('RegObs')
    .factory('MapSearch', function ($rootScope, $http, AppLogging) {
        var service = this;

        service._searchBarVisisble = false;

        service.isVisible = function () {
            return service._searchBarVisisble;
        };

        service.showSearchBar = function () {
            service._searchBarVisisble = true;
            $rootScope.$broadcast('regobs:searchBarVisibleChange');
        };

        service.hideSearchBar = function () {
            service._searchBarVisisble = false;
            $rootScope.$broadcast('regobs:searchBarVisibleChange');
        };

        service.search = function (name, maxant, exactFirst) {
            var url = 'https://ws.geonorge.no/SKWS3Index/ssr/sok';
            if (maxant === undefined) {
                maxant = 10;
            }
            if (exactFirst === undefined) {
                exactFirst = true;
            }

            return $http.get(url + '?navn=' + name + '*&maxant=' + maxant + '&eksakteForst=' + exactFirst +'&epsgKode=3395').then(function (result) {
                if (result && result.data && result.data.stedsnavn) {
                    if (!angular.isArray(result.data.stedsnavn)) {
                        result.data.stedsnavn = [result.data.stedsnavn];
                    }

                    return result.data.stedsnavn.map(function (item) {
                        var latlng = (L.Projection.Mercator.unproject({ x: item.aust, y: item.nord }));
                        return { id: item.ssrId, name: item.stedsnavn, description: item.navnetype + ', ' + item.kommunenavn + ', ' + item.fylkesnavn, type: item.navnetype, latlng: latlng };
                    });
                } else {
                    return [];
                }
            });
        };


        return service;

    });