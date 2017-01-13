angular.module('RegObs')
    .controller('AppCtrl', function ($scope, $rootScope, $state, $ionicHistory, AppSettings, Registration, Property, Trip, User, RegobsPopup, HeaderColor, AppLogging, $ionicSideMenuDelegate, $ionicPopover) {
        var appVm = this;

        appVm.registration = Registration;
        appVm.userService = User;
        appVm.registrationIsType = Registration.doesExistUnsent;
        appVm.trip = Trip;

        function resetForm(confirm){
            if(confirm){
                appVm.tripId = undefined;
                appVm.tripMinutes = undefined;
                appVm.tripComment = undefined;
            }
        }

        appVm.resetTrip = function () {
            if(appVm.tripId || appVm.tripMinutes || appVm.tripComment)
            RegobsPopup.delete('Nullstill', 'Vil du nullstille skjema?', 'Nullstill')
                .then(resetForm);

        };

        appVm.startTrip = function (id, expectedMinutes, comment) {
            Trip.start(10,id,expectedMinutes,comment);
        };

        appVm.stopTrip = function () {
            Trip.stop().then(resetForm);
        };

        appVm.propertyExists = function(prop){
            return Property.exists(prop);
        };

        appVm.openTopPopover = function ($event) {
            appVm.topPopover.show($event);
        };

        appVm.resetProperty = function () {
            var prop = $state.current.data.registrationProp;

            Property.reset(prop);
        };

        appVm.hasRegistration = function() {
            return !(appVm.registration.isEmpty() && !appVm.registration.unsent.length);
        };

        appVm.getEnvClass = function () {
            return AppSettings.data.env === 'regObs' ? 'bar-dark' : (AppSettings.data.env === 'demo regObs' ? 'bar-assertive' : 'bar-calm');
        };

        appVm.getAppMode = AppSettings.getAppMode;
        appVm.setAppMode = AppSettings.setAppMode;

        appVm.showTripFooter = function () {
            return $state.current && $state.current.data && $state.current.data.showTripFooter;
        };

        appVm.showFormFooter = function () {
            return $state.current && $state.current.data && $state.current.data.showFormFooter;
        };

        appVm.showRegistrationFooter = function () {
            return $state.current && $state.current.data && $state.current.data.showRegistrationFooter && appVm.hasRegistration();
        };

        appVm.showMapToggle = function () {
            return $state.current && $state.current.data && $state.current.data.showMapToggle;
        };

        var popoverScope = $rootScope.$new();
        popoverScope.currentAppMode = AppSettings.getAppMode();
        popoverScope.goToSettings = function() {
            appVm.topPopover.hide();
            $state.go('settings');
        };
        popoverScope.changeAppMode = function (mode) {
            appVm.topPopover.hide();
            AppSettings.setAppMode(mode);
        };
        popoverScope.isLoggedIn = function() {
            return !User.getUser().anonymous;
        };
        
        $ionicPopover.fromTemplateUrl('app/menus/topPopover.html', { scope: popoverScope }).then(function (popover) {
            appVm.topPopover = popover;
        });

        appVm.showFooter = function () {
            return appVm.showTripFooter() ||
                appVm.showFormFooter() ||
                appVm.showRegistrationFooter();
        };

        $scope.$on('$ionicView.loaded', function () {
            HeaderColor.init();
        });

        $scope.$on('$stateChangeStart', function () {
            AppLogging.log(Registration.data);
            var currentProp = ($state.current.data || {}).registrationProp;
            if (currentProp) {
                if (currentProp === 'SnowProfile' && Registration.hasImageForRegistration(currentProp)) {
                    var reg = Registration.initPropertyAsObject(currentProp);
                    reg.SnowProfile.Comment = 'Snøprofil fra app';
                }

                if(!Registration.propertyExists(currentProp)){
                    AppLogging.log('DELETE ' + currentProp);
                    delete Registration.data[currentProp];
                }
            }

        });

        $scope.$on('$ionicView.enter', function () {
            Trip.checkIfTripShouldBeAutoStopped();
            appVm.currentState = $state.current;
            AppLogging.log(appVm.currentState);
            ga_storage._trackPageview(appVm.currentState.name);
            $ionicSideMenuDelegate.edgeDragThreshold(25);
        });
    });
