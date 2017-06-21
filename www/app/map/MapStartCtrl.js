angular.module('RegObs')
    .controller('MapStartCtrl', function ($scope, $stateParams, $rootScope, $state, $ionicHistory, User, Map, AppSettings, Registration, AppLogging, Utility, $timeout, $ionicPopover, $cordovaInAppBrowser, Observations, RegobsPopup, UserLocation, $translate, Trip, Translate, OfflineMap, $ionicPopup, MapSearch) {
        var appVm = this;

        appVm.gpsCenterClick = Map.centerMapToUser;
        appVm.openSelectedItem = function () {
            if (appVm.mapSelectedItem && appVm.mapSelectedItem.isClickable()) {
                appVm.mapSelectedItem.onClick();
            }
        };

        appVm.registration = Registration;

        appVm.gotoRegistration = function () {
            Registration.createAndGoToNewRegistration();
        };

        appVm.hasRegistration = function () {
            return Registration.hasStarted() || Registration.unsent.length > 0;
        };

        var popoverScope = {
            updateObservationsInMap: function () {
                appVm.mapMenu.hide();
                Map.updateObservationsInMap();
            },
            viewObservations: function () {
                appVm.mapMenu.hide();
                $state.go('observationlist');
            },
            openWebWarning: function () {
                appVm.mapMenu.hide();
                var url = AppSettings.getWarningUrl();
                $cordovaInAppBrowser.open(url, '_system');
            },
            getCurrentGeoHazardName: function () {
                return Utility.getCurrentGeoHazardName();
            },
            newRegistration: function () {
                appVm.mapMenu.hide();
                Registration.createAndGoToNewRegistration();
            },
            showNewRegistration: function () {
                return !Registration.hasStarted();
            },
            showTrip: function () {
                return Trip.canStart();
            },
            tripStarted: function () {
                return Trip.model.started;
            },
            newTrip: function () {
                appVm.mapMenu.hide();
                $state.go('snowtrip');
            },
            stopTrip: function () {
                appVm.mapMenu.hide();
                Trip.stop();
            }
        };

        $ionicPopover.fromTemplateUrl('app/menus/mapPopoverMenu.html', { scope: angular.merge($rootScope.$new(), popoverScope) }).then(function (popover) {
            appVm.mapMenu = popover;
        });

        appVm.openMapMenu = function ($event) {
            appVm.mapMenu.show($event);
        };

        appVm.getCurrentAppMode = function () {
            return AppSettings.getAppMode();
        };


        appVm.getFollowMode = Map.getFollowMode;

        $scope.$on('$ionicView.enter', function () {
            $ionicHistory.clearHistory();              
            Map.invalidateSize();
            Map.startWatch();

            document.addEventListener("deviceready", function () {
                OfflineMap.getOfflineAreaBounds().then(function (result) {
                    Map.setOfflineAreaBounds(result);
                });
            });
        });

        appVm._setObsWatchTimer = function () {
            appVm._checkObsWatch = $timeout(function () {
                if (Observations.checkIfObservationsShouldBeUpdated() && UserLocation.hasUserLocation() && Utility.hasGoodNetwork()) {
                    $translate(['UPDATE_OBSERVATIONS_IN_MAP', 'UPDATE_OBSERVATIONS_IN_MAP_HELP_TEXT', 'UPDATE_OBSERVATIONS_IN_MAP_HELP_TEXT_2', 'CANCEL', 'OK']).then(function (translations) {
                        appVm._updateObservationsPopup = $ionicPopup.confirm({
                            title: translations['UPDATE_OBSERVATIONS_IN_MAP'],
                            template: '<div class="text-center popup-icon"><i class="icon ion-loop"></i></div><p>' +
                            translations['UPDATE_OBSERVATIONS_IN_MAP_HELP_TEXT'] +
                            '</p><p>' +
                            translations['UPDATE_OBSERVATIONS_IN_MAP_HELP_TEXT_2'] +
                            '</p>',
                            buttons: [
                                {
                                    text: translations['CANCEL'],
                                },
                                {
                                    text: translations['OK'],
                                    type: 'button-positive',
                                    onTap: function (e) {
                                        // Returning a value will cause the promise to resolve with the given value.
                                        return true;
                                    }
                                }
                            ]
                        });
                        appVm._updateObservationsPopup.then(function (response) {
                            if (response) {
                                Map.updateObservationsInMap();
                            }
                        });
                    });


                }
            }, 10000);
        }

        if ($stateParams.showLegalPopup){
            RegobsPopup.showLegalInfo().then(function () {
                appVm._setObsWatchTimer();
            });
        } else {
            appVm._setObsWatchTimer();
        }


        $scope.$on('$ionicView.beforeLeave', function () {
            MapSearch.hideSearchBar();
            Map.clearWatch();
            if (appVm._checkObsWatch) {
                $timeout.cancel(appVm._checkObsWatch);
            }
            if (appVm._updateObservationsPopup) {
                appVm._updateObservationsPopup.close();
            }
        });

        $scope.$on('$regObs:mapItemSelected', function (event, item) {
            $timeout(function () {
                appVm.mapSelectedItem = item;
            });
        });
    });
