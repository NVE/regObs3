angular.module('RegObs')
    .controller('AppCtrl', function ($scope, $state, AppSettings, Registration, Pictures, Trip, User, RegobsPopup, HeaderColor) {
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
            return Registration.propertyExists(prop) || Pictures.hasPictures(prop);
        };

        appVm.resetProperty = function () {
            var prop = $state.current.data.registrationProp;

            if(appVm.propertyExists(prop))
                RegobsPopup.delete('Tøm skjema?', 'Vil du nullstille dette skjemaet?', 'Nullstill').then(
                    function(res){
                        if(res){
                            Registration.resetProperty(prop);
                            Pictures.removePictures(prop);
                            $scope.$broadcast('$ionicView.loaded');
                        }
                    }
                );
        };

        $scope.$applyAsync(function(){
            HeaderColor.init();
        });

        $scope.$on('$ionicView.loaded', function () {
        });

        $scope.$on('$stateChangeStart', function () {
            console.log(Registration.data);
            var currentProp = ($state.current.data || {}).registrationProp;
            if(currentProp) {
                if(!Registration.propertyExists(currentProp)){
                    console.log('DELETE ' + currentProp);
                    delete Registration.data[currentProp];
                }
            }

        });

        $scope.$on('$ionicView.afterLeave', function () {
            Registration.save();
        });

        $scope.$on('$ionicView.enter', function () {
            appVm.currentState = $state.current;
            console.log(appVm.currentState);
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
