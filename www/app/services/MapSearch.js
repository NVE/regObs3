angular
    .module('RegObs')
    .factory('MapSearch', function ($rootScope, $http, AppLogging, $q, $ionicPopup, IonicClosePopupService) {
        var service = this;

        service._searchUrl = 'https://ws.geonorge.no/SKWS3Index/ssr/sok';
        service._defaultMaxResult = 30;
        service._defaultExactFirst = true;
        service._searchBarVisisble = false;

        /**
        * Is search bar visible?
        */
        service.isVisible = function () {
            return service._searchBarVisisble;
        };

        /**
        * Show search bar
        */
        service.showSearchBar = function () {
            service._searchBarVisisble = true;
            service.popup = $ionicPopup.show({ cssClass: 'search-bar-popup', template:'<regobs-map-search-bar></regobs-map-search-bar>'});
            IonicClosePopupService.register(service.popup);
            $rootScope.$broadcast('regobs:searchBarVisibleChange');

            service.popup.then(service.hideSearchBar);
        };

        /**
        * Hide search bar
        */
        service.hideSearchBar = function () {
            service.cancelSearch();
            service._searchBarVisisble = false;
            if (service.popup) {
                service.popup.close();
            }
            $rootScope.$broadcast('regobs:searchBarVisibleChange');
        };

        /**
        * Cancel current search
        */
        service.cancelSearch = function () {
            if (service._cancelPromise) {
                service._cancelPromise.resolve();
            }
        }


        /**
        * Search place by name
        * Returns promise with array of search result
        */
        service.search = function (name, maxResults, exactFirst) {
            service.cancelSearch(); //Cancel last search if still running
            service._cancelPromise = $q.defer();

            return service._callSearch(name,
                maxResults === undefined ? service._defaultMaxResult : maxResults,
                exactFirst === undefined ? service._defaultExactFirst : exactFirst,
                service._cancelPromise.promise)
                .then(service._processSearchResults);
        };

        /******************************************** Internal helper methods **************************************/

        /**
        * Remove duplicated from list
        */
        service._removeDuplicates = function (inArray) {
            var arr = [];
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

        /**
        * Map kartverk item to generic search result item
        */
        service._mapItem = function (item) {
            var latlng = (L.Projection.Mercator.unproject({ x: item.aust, y: item.nord }));
            return { id: item.ssrId, name: item.stedsnavn, description: item.navnetype + ', ' + item.kommunenavn + ', ' + item.fylkesnavn, type: item.navnetype, latlng: latlng };
        };

        /**
        * Process service call result
        */
        service._processSearchResults = function (result) {
            if (result && result.data && result.data.stedsnavn) {
                if (!angular.isArray(result.data.stedsnavn)) {
                    result.data.stedsnavn = [result.data.stedsnavn];
                }
                var arr = service._removeDuplicates(result.data.stedsnavn);
                return arr.map(service._mapItem);
            } else {
                return [];
            }
        };

        /**
        * Internal http call service
        */
        service._callSearch = function (name, maxResults, exactFirst, timeout) {
            return $http.get(service._searchUrl + '?navn=' + name + '*&antPerSide=' + maxResults + '&eksakteForst=' + exactFirst + '&epsgKode=3395',
                { timeout: timeout });
        };

        /******************************************** End Internal helper methods **************************************/

        return service;

    });