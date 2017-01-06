angular.module('RegObs')
    .controller('AppCtrl', function ($scope, $state, AppSettings, Registration, Property, Trip, User, RegobsPopup, HeaderColor, AppLogging) {
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

        appVm.resetProperty = function () {
            var prop = $state.current.data.registrationProp;

            Property.reset(prop);
        };

        $scope.$applyAsync(function(){
            HeaderColor.init();
        });

        $scope.$on('$ionicView.loaded', function () {
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
            appVm.showTripFooter = $state.current.data.showTripFooter;
            appVm.showFormFooter = $state.current.data.showFormFooter;
            appVm.showRegistrationFooter = $state.current.data.showRegistrationFooter;
        });

        $scope.$on('$ionicView.beforeEnter', function () {

            appVm.showTripFooter = $state.current.data.showTripFooter;
            appVm.showFormFooter = $state.current.data.showFormFooter;
            appVm.showRegistrationFooter = $state.current.data.showRegistrationFooter;
        });


    });
