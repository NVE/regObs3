angular.module('RegObs')
    .controller('AppCtrl', function ($scope, $ionicModal, $state, ObsLocation, LocalStorage, Registration, AppSettings, User, RegobsPopup) {
        var appVm = this;

        appVm.registration = Registration;
        appVm.settings = AppSettings;
        appVm.userService = User;

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

        appVm.logOut = function () {
            appVm.username = '';
            appVm.password = '';
            User.logOut();
            //appVm.user = User.getUser();
        };

        appVm.clearAppStorage = function () {
            RegobsPopup.delete('Nullstill app?', 'Vil du slette lokalt lagret data og nullstille appen?', 'Nullstill').then(
                function(res) {
                    if(res) {
                        LocalStorage.clear();
                        Registration.load();
                        AppSettings.load();
                        User.load();
                        headerColor.init();
                        appVm.username = '';
                        appVm.password = '';
                        $state.go('start');
                    }
                });
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
            appVm.showFormFooter = $state.current.data.showFormFooter;
            appVm.showRegistrationFooter = $state.current.data.showRegistrationFooter;

        });


        var headerColor = {
            demoColor: 'bar-assertive',
            prodColor: 'bar-dark',
            removeClass: function (newClass) {
                this.cachedHeaderBar.classList.remove(newClass);
                this.activeHeaderBar.classList.remove(newClass);
            },
            addClass: function (newClass) {
                this.cachedHeaderBar.classList.add(newClass);
                this.activeHeaderBar.classList.add(newClass);
            },
            init: function() {
                this.cachedNavBar = this.cachedNavBar || document.querySelector('.nav-bar-block[nav-bar="cached"]');
                if (this.cachedNavBar)
                    this.cachedHeaderBar = this.cachedHeaderBar || this.cachedNavBar.querySelector('.bar-header');
                else return;

                this.activeNavBar = this.activeNavBar || document.querySelector('.nav-bar-block[nav-bar="active"]');
                if (this.activeNavBar)
                    this.activeHeaderBar = this.activeHeaderBar || this.activeNavBar.querySelector('.bar-header');
                else return;

                if (AppSettings.data.env === 'demo') {
                    this.removeClass(this.prodColor);
                    this.addClass(this.demoColor);
                } else {
                    this.removeClass(this.demoColor);
                    this.addClass(this.prodColor);
                }
            }
        };


        appVm.envChanged = function () {
            AppSettings.save();
            headerColor.init();
        };

        $scope.$applyAsync(function(){
            headerColor.init();
        });

    });