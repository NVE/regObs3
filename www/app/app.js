"use strict";

angular.module('RegObs', ['ionic'])

    .controller('AppCtrl', function($scope, $ionicModal, $ionicHistory, $ionicLoading, LocalStorage, Registration, AppSettings, User){
        var appVm = this;

        $scope.$on('$ionicView.loaded', function() {
            appVm.userService = User;
            appVm.settings = AppSettings;
            console.log(appVm.settings.env);

            appVm.logIn = function () {
                appVm.loggingIn = true;
                User.logIn(appVm.username, appVm.password).then(function() {
                    //appVm.user = User.getUser();
                    appVm.loggingIn = false;

                });
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
            };

            $ionicModal.fromTemplateUrl('app/settings/settings.html', {
                scope: $scope,
                animation: 'slide-in-up',
                focusFirstInput: true
            }).then(function(modal) {
                appVm.modal = modal;
            });

            //Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function() {
                appVm.modal.remove();
            });
            // Execute action on hide modal
            $scope.$on('modal.hidden', function() {
                // Execute action
            });
            // Execute action on remove modal
            $scope.$on('modal.removed', function() {
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
    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {


        if (ionic.Platform.isAndroid()) {
           $ionicConfigProvider.scrolling.jsScrolling(false);
        }

        $urlRouterProvider.otherwise('/app/snow');
        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'app/app.html',
                controller: 'AppCtrl as appVm'
            })

            .state('app.snow', {
                url: '/snow',
                views: {
                    'snow-tab': {
                        templateUrl: 'app/snow/snow.html',
                        controller: 'SnowCtrl as vm'
                    }
                }

            })
            .state('app.snowregistration', {
                url: '/snowregistration',
                views: {
                    'snow-tab': {
                        templateUrl: 'app/snow/snowregistration/snowregistration.html',
                        controller: 'SnowRegistrationCtrl as vm'
                    }
                },
                data: {
                    defaultBack: {
                        state: 'app.snow',
                        title: 'Snø'
                    }
                }
            })
            .state('app.snowdangerobs', {
                url: '/snowdangerobs',
                views: {
                    'snow-tab': {
                        templateUrl: 'app/snow/snowregistration/snowdangerobs/snowdangerobs.html',
                        controller: 'SnowDangerObsCtrl as vm'
                    }
                },
                data: {
                    defaultBack: {
                        state: 'app.snowregistration',
                        title: 'Snøobservasjon'
                    }
                }
            })
            .state('app.snowgeneralobs', {
                url: '/snowgeneralobs',
                views: {
                    'snow-tab': {
                        templateUrl: 'app/snow/snowregistration/snowgeneralobs/snowgeneralobs.html',
                        controller: 'SnowGeneralObsCtrl as vm'
                    }
                },
                data: {
                    defaultBack: {
                        state: 'app.snowregistration',
                        title: 'Snøobservasjon'
                    }
                }
            })
            .state('app.snowweatherobservation', {
                url: '/snowweatherobservation',
                views: {
                    'snow-tab': {
                        templateUrl: 'app/snow/snowregistration/snowweatherobservation/snowweatherobservation.html',
                        controller: 'SnowWeatherObservationCtrl as vm'
                    }
                },
                data: {
                    defaultBack: {
                        state: 'app.snowregistration',
                        title: 'Snøobservasjon'
                    }
                }
            })

            .state('app.snowsurfaceobservation', {
                url: '/snowsurfaceobservation',
                views: {
                    'snow-tab': {
                        templateUrl: 'app/snow/snowregistration/snowsurfaceobservation/snowsurfaceobservation.html',
                        controller: 'SnowSurfaceObservationCtrl as vm'
                    }
                },
                data: {
                    defaultBack: {
                        state: 'app.snowregistration',
                        title: 'Snøobservasjon'
                    }
                }
            })
            .state('app.avalancheevaluation', {
                url: '/avalancheevaluation',
                views: {
                    'snow-tab': {
                        templateUrl: 'app/snow/snowregistration/avalancheevaluation/avalancheevaluation.html',
                        controller: 'AvalancheEvaluationCtrl as vm'
                    }
                },
                data: {
                    defaultBack: {
                        state: 'app.snowregistration',
                        title: 'Snøobservasjon'
                    }
                }
            })
            .state('app.avalancheobs', {
                url: '/avalancheobs',
                views: {
                    'snow-tab': {
                        templateUrl: 'app/snow/snowregistration/avalancheobs/avalancheobs.html',
                        controller: 'AvalancheObsCtrl as vm'
                    }
                },
                data: {
                    defaultBack: {
                        state: 'app.snowregistration',
                        title: 'Snøobservasjon'
                    }
                }
            })
            .state('app.ice', {
                url: '/ice',
                views: {
                    'ice-tab': {
                        templateUrl: 'app/ice/ice.html',
                        controller: 'IceCtrl as vm'
                    }
                }
            })
            .state('app.iceregistration', {
                url: '/iceregistration',
                views: {
                    'ice-tab': {
                        templateUrl: 'app/ice/iceregistration/iceregistration.html',
                        controller: 'IceRegistrationCtrl as vm'
                    }
                },
                data: {
                    defaultBack: {
                        state: 'app.ice',
                        title: 'Is'
                    }
                }
            })
            .state('app.icedangerobs', {
                url: '/icedangerobs',
                views: {
                    'ice-tab': {
                        templateUrl: 'app/ice/iceregistration/icedangerobs/icedangerobs.html',
                        controller: 'IceDangerObsCtrl as vm'
                    }
                },
                data: {
                    defaultBack: {
                        state: 'app.iceregistration',
                        title: 'Isobservasjon'
                    }
                }
            })

            .state('app.icecoverobs', {
                url: '/icecoverobs',
                views: {
                    'ice-tab': {
                        templateUrl: 'app/ice/iceregistration/icecoverobs/icecoverobs.html',
                        controller: 'IceCoverObsCtrl as vm'
                    }
                },
                data: {
                    defaultBack: {
                        state: 'app.iceregistration',
                        title: 'Isobservasjon'
                    }
                }
            })
            .state('app.icegeneralobs', {
                url: '/icegeneralobs',
                views: {
                    'ice-tab': {
                        templateUrl: 'app/ice/iceregistration/icegeneralobs/icegeneralobs.html',
                        controller: 'IceGeneralObsCtrl as vm'
                    }
                },
                data: {
                    defaultBack: {
                        state: 'app.iceregistration',
                        title: 'Isobservasjon'
                    }
                }
            })
            .state('app.iceincident', {
                url: '/iceincident',
                views: {
                    'ice-tab': {
                        templateUrl: 'app/ice/iceregistration/iceincident/iceincident.html',
                        controller: 'IceIncidentCtrl as vm'
                    }
                },
                data: {
                    defaultBack: {
                        state: 'app.iceregistration',
                        title: 'Isobservasjon'
                    }
                }
            })
            .state('app.icethickness', {
                url: '/icethickness',
                views: {
                    'ice-tab': {
                        templateUrl: 'app/ice/iceregistration/icethickness/icethickness.html',
                        controller: 'IceThicknessCtrl as vm'
                    }
                },
                data: {
                    defaultBack: {
                        state: 'app.iceregistration',
                        title: 'Isobservasjon'
                    }
                }
            })
            .state('app.water', {
                url: '/water',
                views: {

                    'water-tab': {
                        templateUrl: 'app/water/water.html',
                        controller: 'WaterCtrl as vm'
                    }
                }

            })
            .state('app.dirt', {
                url: '/dirt',
                views: {

                    'dirt-tab': {
                        templateUrl: 'app/dirt/dirt.html',
                        controller: 'DirtCtrl as vm'
                    }
                }

            });

    })

    .run(function($ionicPlatform) {
        $ionicPlatform.ready(function() {


            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)*/
            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    });
