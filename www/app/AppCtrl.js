angular.module('RegObs')
    .controller('AppCtrl', function ($scope, $ionicModal, $state, ObsLocation, LocalStorage, Registration, AppSettings, User) {
        var appVm = this;

        $scope.$on('$ionicView.loaded', function () {
            appVm.userService = User;
            appVm.settings = AppSettings;
            console.log(appVm.settings.env);

            appVm.getLocation = ObsLocation.get;

            appVm.logIn = function () {
                appVm.loggingIn = true;
                User.logIn(appVm.username, appVm.password).then(function () {
                    //appVm.user = User.getUser();
                    appVm.loggingIn = false;

                });
            };

            appVm.registrationIsType = Registration.doesExistUnsent;

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

            $ionicModal.fromTemplateUrl('app/settings/settings.html', {
                scope: $scope,
                animation: 'slide-in-up',
                focusFirstInput: true
            }).then(function (modal) {
                appVm.modal = modal;
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

            $scope.$on('$ionicView.afterLeave', function () {
                appVm.modal.hide();
                Registration.save();
            });

            $scope.$on('$ionicView.beforeEnter', function () {
                appVm.showFormFooter = $state.current.data.showFormFooter;
                appVm.showRegistrationFooter = $state.current.data.showRegistrationFooter;
            });

        });

    });