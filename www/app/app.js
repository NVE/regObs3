"use strict";

angular.module('RegObs', ['ionic', 'ngCordova'])
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
                templateUrl: 'app/app.html',
                data: {
                    showRegistrationFooter: true
                }
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
                    },
                    showRegistrationFooter: true
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
                    },
                    showRegistrationFooter: true
                }
            })
            .state('snowdangerobs', {
                //Faretegn
                url: '/snowdangerobs',
                templateUrl: 'app/snow/snowregistration/snowdangerobs/snowdangerobs.html',
                controller: 'SnowDangerObsCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration,
                    showFormFooter: true,
                    registrationProp: 'DangerObs'
                }
            })
            .state('avalancheobs', {
                //Skred
                url: '/avalancheobs',
                templateUrl: 'app/snow/snowregistration/avalancheobs/avalancheobs.html',
                controller: 'AvalancheObsCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration,
                    showFormFooter: true,
                    registrationProp: 'AvalancheObs'
                }
            })
            .state('snowweatherobservation', {
                //Vær
                url: '/snowweatherobservation',
                templateUrl: 'app/snow/snowregistration/snowweatherobservation/snowweatherobservation.html',
                controller: 'SnowWeatherObservationCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration,
                    showFormFooter: true,
                    registrationProp: 'WeatherObservation'
                }
            })
            .state('snowsurfaceobservation', {
                //Snødekke
                url: '/snowsurfaceobservation',
                templateUrl: 'app/snow/snowregistration/snowsurfaceobservation/snowsurfaceobservation.html',
                controller: 'SnowSurfaceObservationCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration,
                    showFormFooter: true,
                    registrationProp: 'SnowSurfaceObservation'
                }
            })
            .state('snowprofile', {
                //Snøprofil
                url: '/snowprofile',
                templateUrl: 'app/snow/snowregistration/snowprofile/snowprofile.html',
                controller: 'SnowProfileCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration,
                    showFormFooter: true,
                    registrationProp: 'SnowProfile'
                }
            })
            .state('avalancheevalproblem', {
                //Skredproblem
                url: '/avalancheevalproblem',
                templateUrl: 'app/snow/snowregistration/avalancheevalproblem/avalancheevalproblem.html',
                controller: 'AvalancheEvalProblemCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration,
                    showFormFooter: true,
                    registrationProp: 'AvalancheEvalProblem2'
                }
            })
            .state('avalancheevaluation', {
                //Skredfarevurdering
                url: '/avalancheevaluation',
                templateUrl: 'app/snow/snowregistration/avalancheevaluation/avalancheevaluation.html',
                controller: 'AvalancheEvaluationCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration,
                    showFormFooter: true,
                    registrationProp: 'AvalancheEvaluation3'
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
                    },
                    showRegistrationFooter: true
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
                    },
                    showRegistrationFooter: true
                }
            })
            .state('icedangerobs', {
                //Faretegn
                url: '/icedangerobs',
                templateUrl: 'app/ice/iceregistration/icedangerobs/icedangerobs.html',
                controller: 'IceDangerObsCtrl as vm',
                data: {
                    defaultBack: defaultBackIceRegistration,
                    showFormFooter: true,
                    registrationProp: 'DangerObs'
                }
            })
            .state('icecoverobs', {
                //Isdekningsgrad
                url: '/icecoverobs',
                templateUrl: 'app/ice/iceregistration/icecoverobs/icecoverobs.html',
                controller: 'IceCoverObsCtrl as vm',
                data: {
                    defaultBack: defaultBackIceRegistration,
                    showFormFooter: true,
                    registrationProp: 'IceCoverObs'
                }
            })
            .state('icethickness', {
                //Istykkelse
                url: '/icethickness',
                templateUrl: 'app/ice/iceregistration/icethickness/icethickness.html',
                controller: 'IceThicknessCtrl as vm',
                data: {
                    defaultBack: defaultBackIceRegistration,
                    showFormFooter: true,
                    registrationProp: 'IceThickness'
                }
            })
            .state('iceincident', {
                //Ulykke/hendelse
                url: '/iceincident',
                templateUrl: 'app/ice/iceregistration/iceincident/iceincident.html',
                controller: 'IceIncidentCtrl as vm',
                data: {
                    defaultBack: defaultBackIceRegistration,
                    showFormFooter: true,
                    registrationProp: 'Incident'
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
                    },
                    showRegistrationFooter: true
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
                    },
                    showRegistrationFooter: true
                }
            })
            .state('waterdangerobs', {
                //Faretegn
                url: '/waterdangerobs',
                templateUrl: 'app/water/waterregistration/waterdangerobs/waterdangerobs.html',
                controller: 'WaterDangerObsCtrl as vm',
                data: {
                    defaultBack: defaultBackWaterRegistration,
                    showFormFooter: true,
                    registrationProp: 'DangerObs'
                }
            })
            .state('waterlevel', {
                //Faretegn
                url: '/waterlevel',
                templateUrl: 'app/water/waterregistration/waterlevel/waterlevel.html',
                controller: 'WaterLevelCtrl as vm',
                data: {
                    defaultBack: defaultBackWaterRegistration,
                    showFormFooter: true,
                    registrationProp: 'WaterLevel'
                }
            })
            .state('waterincident', {
                //Faretegn
                url: '/waterincident',
                templateUrl: 'app/water/waterregistration/waterincident/waterincident.html',
                controller: 'WaterIncidentCtrl as vm',
                data: {
                    defaultBack: defaultBackWaterRegistration,
                    showFormFooter: true,
                    registrationProp: 'Incident'
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
                    },
                    showRegistrationFooter: true
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
                    },
                    showRegistrationFooter: true
                }
            })
            .state('dirtdangerobs', {
                //Faretegn
                url: '/dirtdangerobs',
                templateUrl: 'app/dirt/dirtregistration/dirtdangerobs/dirtdangerobs.html',
                controller: 'DirtDangerObsCtrl as vm',
                data: {
                    defaultBack: defaultBackDirtRegistration,
                    showFormFooter: true,
                    registrationProp: 'DangerObs'
                }
            })
            .state('landslideobs', {
                //Skredhendelse
                url: '/landslideobs',
                templateUrl: 'app/dirt/dirtregistration/landslideobs/landslideobs.html',
                controller: 'LandSlideObsCtrl as vm',
                data: {
                    defaultBack: defaultBackDirtRegistration,
                    showFormFooter: true,
                    registrationProp: 'LandSlideObs'
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
                    },
                    showFormFooter: true,
                    registrationProp: 'GeneralObservation'
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
