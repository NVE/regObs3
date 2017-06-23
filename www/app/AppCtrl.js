angular.module('RegObs')
    .controller('AppCtrl', function ($scope, $rootScope, $state, $ionicHistory, AppSettings, Registration, Property, Trip, User, RegobsPopup, HeaderColor, AppLogging, $ionicSideMenuDelegate, $ionicPopover, Pictures) {
        var appVm = this;

        $scope.$on('$ionicView.loaded', function () {
            HeaderColor.init();
        });

        $scope.$on('$regObs:beforeSave', function () {
            var currentProp = ($state.current.data || {}).registrationProp;
            if (currentProp && !Registration.propertyExists(currentProp) && !Pictures.hasPictures(currentProp)) {
                AppLogging.log('DELETE empty registration for: ' + currentProp + ' current registration: ' + JSON.stringify(Registration.data));
                delete Registration.data[currentProp];
            }
        });

        $scope.$on('$ionicView.enter', function () {
            Trip.checkIfTripShouldBeAutoStopped();
            appVm.currentState = $state.current;
            ga_storage._trackPageview(appVm.currentState.name);
            $ionicSideMenuDelegate.edgeDragThreshold(25);
        });

        $scope.$on('$regObs:registrationSaved', function () {
            $ionicHistory.clearCache(['userobservations']);
        });
    });
