angular.module('RegObs')
    .controller('AppCtrl', function ($scope, $state, AppSettings, Registration, User, RegobsPopup, HeaderColor) {
        var appVm = this;

        appVm.registration = Registration;
        appVm.userService = User;
        appVm.registrationIsType = Registration.doesExistUnsent;

        appVm.resetProperty = function () {
            var prop = $state.current.data.registrationProp;
            if(Registration.propertyExists(prop))
                RegobsPopup.delete('Tøm skjema?', 'Vil du nullstille dette skjemaet?', 'Nullstill').then(
                    function(res){
                        if(res){
                            Registration.resetProperty(prop);
                            $scope.$broadcast('$ionicView.loaded');
                        }
                    }
                );
        };

        appVm.timeChanged = function (newTime) {
            Registration.data.DtObsTime = new Date(newTime).toISOString();
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

        $scope.$on('$ionicView.beforeEnter', function () {
            appVm.currentState = $state.current;
            console.log(appVm.currentState);
            appVm.showFormFooter = $state.current.data.showFormFooter;
            appVm.showRegistrationFooter = $state.current.data.showRegistrationFooter;
        });


    });