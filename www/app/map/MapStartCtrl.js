﻿angular.module('RegObs')
    .controller('MapStartCtrl', function ($scope, $rootScope, $state, $ionicHistory, Map, AppSettings, Registration, AppLogging, Utility, $timeout, $ionicPopover, $cordovaInAppBrowser) {
        var appVm = this;

        appVm.gotoState = $state.go;
        //appVm.newRegistration = Registration.createAndGoToNewRegistration;
        //appVm.getNewObservationText = Utility.getNewObservationText;
        appVm.gpsCenterClick = Map.centerMapToUser;
        //appVm.updateObservationsInMap = Map.updateObservationsInMap;


        //appVm.showTrip = function () {
        //    return AppSettings.getAppMode() === 'snow';
        //}

        //appVm.showEditRegistration = function () {
        //    return !Registration.isEmpty();
        //}

        appVm.hasRegistration = function () {
            return !(Registration.isEmpty() && !Registration.unsent.length);
        };

        var popoverScope = {
            updateObservationsInMap: function () {
                Map.updateObservationsInMap();
                appVm.mapMenu.hide();
            },
            viewObservations: function () {
                appVm.mapMenu.hide();
                var url = AppSettings.getObservationsUrl();
                $cordovaInAppBrowser.open(url, '_system');
            },
            openWebWarning: function () {
                appVm.mapMenu.hide();
                var url = AppSettings.getWarningUrl();
                $cordovaInAppBrowser.open(url, '_system');
            },
            newRegistration: function () {
                appVm.mapMenu.hide();
                Registration.createAndGoToNewRegistration();
            },
            showEditRegistration: function () {
                return !Registration.isEmpty();
            },
            showTrip: function () {              
                return AppSettings.getAppMode() === 'snow';
            },
            newTrip: function () {
                appVm.mapMenu.hide();
                $state.go('snowtrip');
            }
        };

        $ionicPopover.fromTemplateUrl('app/menus/mapPopoverMenu.html', { scope: angular.merge($rootScope.$new(), popoverScope) }).then(function (popover) {
            appVm.mapMenu = popover;
        });

        appVm.openMapMenu = function ($event) {
            appVm.mapMenu.show($event);
        };

        $scope.$on('$ionicView.enter', function () {
            $ionicHistory.clearHistory();
            Map.updateMapFromSettings();
            Map.startWatch();
        });

        $scope.$on('$ionicView.leave', Map.clearWatch);
        $scope.$on('$regObs.appSettingsChanged', Map.updateMapFromSettings);

        $scope.$on('$regObs:mapItemSelected', function (event, item) {
            $timeout(function () {
                appVm.mapSelectedItem = item;
            });
        });
    });
