"use strict";

angular.module('RegObs', ['ionic', 'ngCordova'])

    .controller('AppCtrl', function ($scope, $ionicModal, $ionicHistory, $ionicLoading, LocalStorage, Registration, AppSettings, User) {
        var appVm = this;

        $scope.$on('$ionicView.loaded', function () {
            appVm.userService = User;
            appVm.settings = AppSettings;
            console.log(appVm.settings.env);

            appVm.logIn = function () {
                appVm.loggingIn = true;
                User.logIn(appVm.username, appVm.password).then(function () {
                    //appVm.user = User.getUser();
                    appVm.loggingIn = false;

                });
            };

            appVm.registrationIsType = Registration.doesExist;

            appVm.logOut = function () {
                appVm.username = '';
                appVm.password = '';
                User.logOut();
                //appVm.user = User.getUser();
            };

            appVm.clearAppStorage = function () {
                LocalStorage.clear();
                Registration.load();
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

            $scope.$on('$ionicView.beforeLeave', function () {
                appVm.modal.hide();
                Registration.save();
            });

        });

    })

/**
 * State configuration
 */
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        if (ionic.Platform.isAndroid()) {
            $ionicConfigProvider.scrolling.jsScrolling(false);
        }

        $urlRouterProvider.otherwise('/start');
        $stateProvider
            .state('start', {
                url: '/start',
                templateUrl: 'app/app.html'
            })
            .state('snow', {
                url: '/snow',

                templateUrl: 'app/snow/snow.html',
                controller: 'SnowCtrl as vm',

                data: {
                    defaultBack: {
                        state: 'start',
                        title: 'regObs'
                    }
                }

            })
            .state('snowregistration', {
                url: '/snowregistration',

                templateUrl: 'app/snow/snowregistration/snowregistration.html',
                controller: 'SnowRegistrationCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'snow',
                        title: 'Snø'
                    }
                }
            })
            .state('snowdangerobs', {
                url: '/snowdangerobs',

                templateUrl: 'app/snow/snowregistration/snowdangerobs/snowdangerobs.html',
                controller: 'SnowDangerObsCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'snowregistration',
                        title: 'Snøobservasjon'
                    }
                }
            })
            .state('snowgeneralobs', {
                url: '/snowgeneralobs',

                templateUrl: 'app/snow/snowregistration/snowgeneralobs/snowgeneralobs.html',
                controller: 'SnowGeneralObsCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'snowregistration',
                        title: 'Snøobservasjon'
                    }
                }
            })
            .state('snowweatherobservation', {
                url: '/snowweatherobservation',

                templateUrl: 'app/snow/snowregistration/snowweatherobservation/snowweatherobservation.html',
                controller: 'SnowWeatherObservationCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'snowregistration',
                        title: 'Snøobservasjon'
                    }
                }
            })

            .state('snowsurfaceobservation', {
                url: '/snowsurfaceobservation',

                templateUrl: 'app/snow/snowregistration/snowsurfaceobservation/snowsurfaceobservation.html',
                controller: 'SnowSurfaceObservationCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'snowregistration',
                        title: 'Snøobservasjon'
                    }
                }
            })
            .state('avalancheevaluation', {
                url: '/avalancheevaluation',

                templateUrl: 'app/snow/snowregistration/avalancheevaluation/avalancheevaluation.html',
                controller: 'AvalancheEvaluationCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'snowregistration',
                        title: 'Snøobservasjon'
                    }
                }
            })
            .state('avalancheobs', {
                url: '/avalancheobs',

                templateUrl: 'app/snow/snowregistration/avalancheobs/avalancheobs.html',
                controller: 'AvalancheObsCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'snowregistration',
                        title: 'Snøobservasjon'
                    }
                }
            })
            .state('ice', {
                url: '/ice',

                templateUrl: 'app/ice/ice.html',
                controller: 'IceCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'start',
                        title: 'regObs'
                    }
                }
            })
            .state('iceregistration', {
                url: '/iceregistration',

                templateUrl: 'app/ice/iceregistration/iceregistration.html',
                controller: 'IceRegistrationCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'ice',
                        title: 'Is'
                    }
                }
            })
            .state('icedangerobs', {
                url: '/icedangerobs',

                templateUrl: 'app/ice/iceregistration/icedangerobs/icedangerobs.html',
                controller: 'IceDangerObsCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'iceregistration',
                        title: 'Isobservasjon'
                    }
                }
            })

            .state('icecoverobs', {
                url: '/icecoverobs',

                templateUrl: 'app/ice/iceregistration/icecoverobs/icecoverobs.html',
                controller: 'IceCoverObsCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'iceregistration',
                        title: 'Isobservasjon'
                    }
                }
            })
            .state('icegeneralobs', {
                url: '/icegeneralobs',

                templateUrl: 'app/ice/iceregistration/icegeneralobs/icegeneralobs.html',
                controller: 'IceGeneralObsCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'iceregistration',
                        title: 'Isobservasjon'
                    }
                }
            })
            .state('iceincident', {
                url: '/iceincident',

                templateUrl: 'app/ice/iceregistration/iceincident/iceincident.html',
                controller: 'IceIncidentCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'iceregistration',
                        title: 'Isobservasjon'
                    }
                }
            })
            .state('icethickness', {
                url: '/icethickness',

                templateUrl: 'app/ice/iceregistration/icethickness/icethickness.html',
                controller: 'IceThicknessCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'iceregistration',
                        title: 'Isobservasjon'
                    }
                }
            })
            .state('water', {
                url: '/water',

                templateUrl: 'app/water/water.html',
                controller: 'WaterCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'start',
                        title: 'regObs'
                    }
                }

            })
            .state('dirt', {
                url: '/dirt',

                templateUrl: 'app/dirt/dirt.html',
                controller: 'DirtCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'start',
                        title: 'regObs'
                    }
                }

            });

    })

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)*/
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }

            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    });
