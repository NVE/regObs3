angular.module('RegObs')
    .controller('AppCtrl', function ($scope, $ionicModal, $state, ObsLocation, LocalStorage, Registration, AppSettings, User) {
        var appVm = this;

        appVm.registration = Registration;
        appVm.settings = AppSettings;
        appVm.userService = User;
        appVm.getLocation = ObsLocation.get;
        appVm.registrationIsType = Registration.doesExistUnsent;

        $ionicModal.fromTemplateUrl('app/settings/settings.html', {
            scope: $scope,
            animation: 'slide-in-up',
            focusFirstInput: true
        }).then(function (modal) {
            appVm.modal = modal;
        });

        appVm.logIn = function () {
            appVm.loggingIn = true;
            User.logIn(appVm.username, appVm.password).then(function () {
                //appVm.user = User.getUser();
                appVm.loggingIn = false;

            });
        };

        appVm.resetProperty = function () {
            Registration.resetProperty($state.current.data.registrationProp);
        };

        appVm.logOut = function () {
            appVm.username = '';
            appVm.password = '';
            User.logOut();
            //appVm.user = User.getUser();
        };

        appVm.clearAppStorage = function () {
            LocalStorage.clear();
            Registration.load();
            $state.go('start');
        };

        $scope.$on('$ionicView.loaded', function () {
        });

        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            appVm.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function () {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function () {
            // Execute action
        });

        $scope.$on('$ionicView.beforeLeave', function () {
            appVm.modal.hide();
        });

        $scope.$on('$stateChangeStart', function () {
            console.log(Registration.data);
            var currentProp = ($state.current.data || {}).registrationProp;
            console.log(currentProp);
            if(currentProp) {
                if(!Registration.propertyArrayExists(currentProp) && !Registration.propertyObjectExists(currentProp)){
                    console.log('DELETE ' + currentProp);
                    delete Registration.data[currentProp];
                }
            }

        });

        $scope.$on('$ionicView.afterLeave', function () {
            Registration.save();
        });

        $scope.$on('$ionicView.beforeEnter', function () {
            appVm.showFormFooter = $state.current.data.showFormFooter;
            appVm.showRegistrationFooter = $state.current.data.showRegistrationFooter;

        });

    });