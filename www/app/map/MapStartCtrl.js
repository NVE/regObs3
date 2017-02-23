angular.module('RegObs')
    .controller('MapStartCtrl', function ($scope, $rootScope, $state, $ionicHistory, Map, AppSettings, Registration, AppLogging, Utility, $timeout, $ionicPopover, $cordovaInAppBrowser, Observations, RegobsPopup, UserLocation, $translate, Trip) {
        var appVm = this;

        appVm.gpsCenterClick = Map.centerMapToUser;
        appVm.openSelectedItem = function () {
            if (appVm.mapSelectedItem && appVm.mapSelectedItem.isClickable()) {
                appVm.mapSelectedItem.onClick();
            }
        };

        appVm.hasRegistration = function () {
            return !(Registration.isEmpty() && !Registration.unsent.length);
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
            getCurrentGeoHazardName: function() {
                return Utility.getCurrentGeoHazardName();
            },
            newRegistration: function () {
                appVm.mapMenu.hide();
                Registration.createAndGoToNewRegistration();
            },
            showNewRegistration: function () {
                return Registration.isEmpty();
            },
            showTrip: function () {
                return AppSettings.getAppMode() === 'snow';
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

        appVm.getCurrentAppMode = function() {
            return AppSettings.getAppMode();
        };


        $scope.$on('$ionicView.enter', function () {
            Map.invalidateSize();
            Map.startWatch();
        });

        appVm._checkObsWatch = $timeout(function () {
            if (Observations.checkIfObservationsShouldBeUpdated() && UserLocation.hasUserLocation() && Utility.hasGoodNetwork()) {
                RegobsPopup.confirm($translate.instant('UPDATE_OBSERVATIONS_IN_MAP'), '<div class="text-center popup-icon"><i class="icon ion-loop"></i></div><p>' + $translate.instant('UPDATE_OBSERVATIONS_IN_MAP_HELP_TEXT') + '</p><p>' + $translate.instant('UPDATE_OBSERVATIONS_IN_MAP_HELP_TEXT_2') +'</p>')
                .then(function (response) {
                    if (response) {
                        Map.updateObservationsInMap();
                    }
                });
           }
        }, 10000);

        $scope.$on('$ionicView.leave', function () {
            Map.clearWatch();
            $timeout.cancel(appVm._checkObsWatch);
        });

        $scope.$on('$regObs:mapItemSelected', function (event, item) {
            $timeout(function () {
                appVm.mapSelectedItem = item;
            });
        });


    });
