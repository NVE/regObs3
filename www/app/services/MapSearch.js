angular
    .module('RegObs')
    .factory('MapSearch', function ($rootScope, $http, AppLogging, $q) {
        var service = this;

        service._searchUrl = 'https://ws.geonorge.no/SKWS3Index/ssr/sok';

        service._searchBarVisisble = false;

        service.isVisible = function () {
            return service._searchBarVisisble;
        };

        service.showSearchBar = function () {
            service._searchBarVisisble = true;
            $rootScope.$broadcast('regobs:searchBarVisibleChange');
        };

        service.hideSearchBar = function () {
            service.cancelSearch();
            service._searchBarVisisble = false;
            $rootScope.$broadcast('regobs:searchBarVisibleChange');
        };

        service.cancelSearch = function () {
            if (service._cancelPromise) {
                service._cancelPromise.resolve();
            }
        }

        service._removeDuplicates = function (inArray) {
            var arr = []; //Remove duplicates on ssrId, yes the service returns duplicates!
            if (angular.isArray(inArray)) {
                inArray.forEach(function (place) {
                    if (arr.filter(function (item) {
                        return item.ssrId === place.ssrId;
                    }).length === 0) {
                        arr.push(place);
                    }
                });
            }
            return arr;
        }

        service.mapItem = function (item) {
            var latlng = (L.Projection.Mercator.unproject({ x: item.aust, y: item.nord }));
            return { id: item.ssrId, name: item.stedsnavn, description: item.navnetype + ', ' + item.kommunenavn + ', ' + item.fylkesnavn, type: item.navnetype, latlng: latlng };
        };

        service._processSearchResults = function (result) {
            if (result && result.data && result.data.stedsnavn) {
                if (!angular.isArray(result.data.stedsnavn)) {
                    result.data.stedsnavn = [result.data.stedsnavn];
                }
                var arr = service._removeDuplicates(result.data.stedsnavn);
                return arr.map(service.mapItem);
            } else {
                return [];
            }
        };

        service._callSearch = function (name, maxResults, exactFirst, timeout) {
            return $http.get(service._searchUrl + '?navn=' + name + '*&antPerSide=' + maxResults + '&eksakteForst=' + exactFirst + '&epsgKode=3395',
                { timeout: timeout });
        };

        /**
        * Search place by name
        *
        */
        service.search = function (name, maxResults, exactFirst) {
            if (maxResults === undefined) {
                maxResults = 10;
            }
            if (exactFirst === undefined) {
                exactFirst = true;
            }

            service.cancelSearch(); //Cancel last search if still running
            service._cancelPromise = $q.defer();
            
            return service._callSearch(name, maxResults, exactFirst, service._cancelPromise.promise).then(service._processSearchResults);
        };


        return service;

    });