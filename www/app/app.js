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

        });

    })

    /**
     * State configuration
     */
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        if (ionic.Platform.isAndroid()) {
            $ionicConfigProvider.scrolling.jsScrolling(false);
        }

        var defaultBackIceRegistration = {
            state: 'iceregistrationNew',
            title: 'Isobservasjon'
        };
        var defaultBackSnowRegistration = {
            state: 'snowregistrationNew',
            title: 'Snøobservasjon'
        };
        var defaultBackDirtRegistration = {
            state: 'dirtregistrationNew',
            title: 'Jordobservasjon'
        };
        var defaultBackWaterRegistration = {
            state: 'waterregistrationNew',
            title: 'Vannobservasjon'
        };

        $urlRouterProvider.otherwise('/start');
        $stateProvider
            .state('start', {
                url: '/start',
                templateUrl: 'app/app.html'
            })

            //SNØ
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
            .state('snowregistrationNew', {
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
                //Faretegn
                url: '/snowdangerobs',
                templateUrl: 'app/snow/snowregistration/snowdangerobs/snowdangerobs.html',
                controller: 'SnowDangerObsCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration
                }
            })
            .state('avalancheobs', {
                //Skred
                url: '/avalancheobs',
                templateUrl: 'app/snow/snowregistration/avalancheobs/avalancheobs.html',
                controller: 'AvalancheObsCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration
                }
            })
            .state('snowweatherobservation', {
                //Vær
                url: '/snowweatherobservation',
                templateUrl: 'app/snow/snowregistration/snowweatherobservation/snowweatherobservation.html',
                controller: 'SnowWeatherObservationCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration
                }
            })
            .state('snowsurfaceobservation', {
                //Snødekke
                url: '/snowsurfaceobservation',
                templateUrl: 'app/snow/snowregistration/snowsurfaceobservation/snowsurfaceobservation.html',
                controller: 'SnowSurfaceObservationCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration
                }
            })
            .state('snowprofile', {
                //Snøprofil
                url: '/snowprofile',
                templateUrl: 'app/snow/snowregistration/snowprofile/snowprofile.html',
                controller: 'SnowProfileCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration
                }
            })
            .state('avalancheevalproblem', {
                //Skredproblem
                url: '/avalancheevalproblem',
                templateUrl: 'app/snow/snowregistration/avalancheevalproblem/avalancheevalproblem.html',
                controller: 'AvalancheEvalProblemCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration
                }
            })
            .state('avalancheevaluation', {
                //Skredfarevurdering
                url: '/avalancheevaluation',
                templateUrl: 'app/snow/snowregistration/avalancheevaluation/avalancheevaluation.html',
                controller: 'AvalancheEvaluationCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration
                }
            })

            //IS
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
            .state('iceregistrationNew', {
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
                //Faretegn
                url: '/icedangerobs',
                templateUrl: 'app/ice/iceregistration/icedangerobs/icedangerobs.html',
                controller: 'IceDangerObsCtrl as vm',
                data: {
                    defaultBack: defaultBackIceRegistration
                }
            })
            .state('icecoverobs', {
                //Isdekningsgrad
                url: '/icecoverobs',
                templateUrl: 'app/ice/iceregistration/icecoverobs/icecoverobs.html',
                controller: 'IceCoverObsCtrl as vm',
                data: {
                    defaultBack: defaultBackIceRegistration
                }
            })
            .state('icethickness', {
                //Istykkelse
                url: '/icethickness',
                templateUrl: 'app/ice/iceregistration/icethickness/icethickness.html',
                controller: 'IceThicknessCtrl as vm',
                data: {
                    defaultBack: defaultBackIceRegistration
                }
            })
            .state('iceincident', {
                //Ulykke/hendelse
                url: '/iceincident',
                templateUrl: 'app/ice/iceregistration/iceincident/iceincident.html',
                controller: 'IceIncidentCtrl as vm',
                data: {
                    defaultBack: defaultBackIceRegistration
                }
            })

            //VANN
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
            .state('waterregistrationNew', {
                url: '/waterregistration',
                templateUrl: 'app/water/waterregistration/waterregistration.html',
                controller: 'WaterRegistrationCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'water',
                        title: 'Vann'
                    }
                }
            })
            .state('waterdangerobs', {
                //Faretegn
                url: '/waterdangerobs',
                templateUrl: 'app/water/waterregistration/waterdangerobs/waterdangerobs.html',
                controller: 'WaterDangerObsCtrl as vm',
                data: {
                    defaultBack: defaultBackWaterRegistration
                }
            })
            .state('waterlevel', {
                //Faretegn
                url: '/waterlevel',
                templateUrl: 'app/water/waterregistration/waterlevel/waterlevel.html',
                controller: 'WaterLevelCtrl as vm',
                data: {
                    defaultBack: defaultBackWaterRegistration
                }
            })
            .state('waterincident', {
                //Faretegn
                url: '/waterincident',
                templateUrl: 'app/water/waterregistration/waterincident/waterincident.html',
                controller: 'WaterIncidentCtrl as vm',
                data: {
                    defaultBack: defaultBackWaterRegistration
                }
            })

            //JORD
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
            })
            .state('dirtregistrationNew', {
                url: '/dirtregistration',
                templateUrl: 'app/dirt/dirtregistration/dirtregistration.html',
                controller: 'DirtRegistrationCtrl as vm',
                data: {
                    defaultBack: {
                        state: 'dirt',
                        title: 'Jord'
                    }
                }
            })
            .state('dirtdangerobs', {
                //Faretegn
                url: '/dirtdangerobs',
                templateUrl: 'app/dirt/dirtregistration/dirtdangerobs/dirtdangerobs.html',
                controller: 'DirtDangerObsCtrl as vm',
                data: {
                    defaultBack: defaultBackDirtRegistration
                }
            })
            .state('landslideobs', {
                //Skredhendelse
                url: '/landslideobs',
                templateUrl: 'app/dirt/dirtregistration/landslideobs/landslideobs.html',
                controller: 'LandSlideObsCtrl as vm',
                data: {
                    defaultBack: defaultBackDirtRegistration
                }
            })

            //Felles
            .state('generalobs', {
                //Fritekst
                url: '/generalobs',
                templateUrl: 'app/generalobs/generalobs.html',
                controller: 'GeneralObsCtrl as vm',
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
                //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }

            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    });
