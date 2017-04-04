angular.module('RegObs')
    .controller('AppCtrl', function ($scope, $rootScope, $state, $ionicHistory, AppSettings, Registration, Property, Trip, User, RegobsPopup, HeaderColor, AppLogging, $ionicSideMenuDelegate, $ionicPopover) {
        var appVm = this;

        $scope.$on('$ionicView.loaded', function () {
            HeaderColor.init();
        });

        $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            var currentProp = ($state.current.data || {}).registrationProp;
            if (currentProp && !Registration.propertyExists(currentProp)) {
                AppLogging.log('DELETE empty registration for: ' + currentProp + ' current registration: ' + JSON.stringify(Registration.data));
                delete Registration.data[currentProp];
                Registration.save();
            }
        });

        $scope.$on('$ionicView.enter', function () {
            Trip.checkIfTripShouldBeAutoStopped();
            appVm.currentState = $state.current;
            ga_storage._trackPageview(appVm.currentState.name);
            $ionicSideMenuDelegate.edgeDragThreshold(25);
        });
    });
