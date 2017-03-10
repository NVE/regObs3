(function () {
    "use strict";

    angular.module('RegObs', ['ionic', 'ngCordova', 'ion-floating-menu', 'angularProgressbar', 'pascalprecht.translate', 'ngWebworker'])
        .config(providers)
        .run(setup);

    function providers($provide, $stateProvider, $urlRouterProvider, $ionicConfigProvider, AppSettingsProvider, $translateProvider, UserProvider) {
        'ngInject';

        $provide.decorator('$exceptionHandler', ['$delegate',
            function ($delegate) {
                return function (exception, cause) {
                    if (ga_storage) {
                        var userService = UserProvider.$get();
                        var appSettings = AppSettingsProvider.$get();
                        var user = userService.getUser();
                        var userText = 'Anonymous user';
                        if (!user.anonymous) {
                            userText = 'User: ' + user.Guid + ' Nick: ' + user.Nick;
                        }

                        var initInjector = angular.injector(['ng']);
                        var $http = initInjector.get('$http');

                        $http.get('app/json/version.json').then(function (version) {
                            var label = 'Error ' + appSettings.data.env + ' ' + version.data.version + ' ' + version.data.build;
                            var action = ((cause || '') + ' ' + exception.message).trim();
                            var stack = userText + ' Stack: ' + exception.stack.replace(/(\r\n|\n|\r)/gm, "\n ○ ");
                            ga_storage._trackEvent(label, action, stack);
                        });
                    }
                    $delegate(exception, cause);
                };
            }
        ]);


        if (ionic.Platform.isAndroid()) {
            $ionicConfigProvider.scrolling.jsScrolling(false);
        }

        var langMap = {
            'nb_NO': 'no'
        };

        $translateProvider.useSanitizeValueStrategy('escapeParameters')
            .useStaticFilesLoader({
                prefix: './app/json/localization/',
                suffix: '.json'
            }).registerAvailableLanguageKeys(['no'], langMap)
            .preferredLanguage('no')
            .fallbackLanguage(['no']);

        var defaultBackIceRegistration = {
            state: 'iceregistrationNew',
            force: true
        };
        var defaultBackSnowRegistration = {
            state: 'snowregistrationNew',
            force: true
        };
        var defaultBackDirtRegistration = {
            state: 'dirtregistrationNew',
            force: true
        };
        var defaultBackWaterRegistration = {
            state: 'waterregistrationNew',
            force: true
        };
        var defaultBackStart = {
            state: 'start',
            title: 'MAP',
            force: true
        };
        var defaultBackHelp = {
            state: 'start'
        };

        if (!AppSettingsProvider.$get().hasSetAppMode()) {
            $urlRouterProvider.otherwise('/wizard');
        } else {
            $urlRouterProvider.otherwise('/start');
        }

        $stateProvider
            .state('wizard', {
                url: '/wizard',
                templateUrl: 'app/startwizard/startwizard.html',
                controller: 'StartWizardCtrl as vm',
                cache: false
            })
            .state('start', {
                url: '/start',
                templateUrl: 'app/map/mapstart.html',
                controller: 'MapStartCtrl as vm',
                data: {
                    showMapToggle: true,
                    showRegistrationFooter: true,
                    clearHistory: true
                }
            })
            .state('settings', {
                url: '/settings',
                templateUrl: 'app/settings/settingsview.html',
                controller: 'SettingsViewCtrl as vm',
                data: {
                    defaultBack: defaultBackHelp,
                    showSettings: false
                }
            })
            .state('offlinemapoverview', {
                url: '/offlinemapoverview',
                templateUrl: 'app/map/offlinemapoverview.html',
                controller: 'OfflineMapOverviewCtrl as vm',
                data: {
                    defaultBack: defaultBackStart,
                    showSettings: false
                }
            })
            .state('mapareadownload', {
                url: '/mapareadownload',
                templateUrl: 'app/map/mapareadownload.html',
                controller: 'MapAreaDownloadCtrl as vm',
                cache: false,
                data: {
                    defaultBack: {
                        state: 'offlinemapoverview'
                    },
                    showSettings: false
                }
            })
            .state('offlineareadetails', {
                url: '/offlineareadetails',
                templateUrl: 'app/map/offlineareadetails.html',
                controller: 'OfflineAreaDetailsCtrl as vm',
                cache: false,
                params: { area: null },
                data: {
                    defaultBack: {
                        state: 'offlinemapoverview'
                    },
                    showSettings: false
                }
            })

            .state('observationdetails', {
                url: '/observationdetails',
                templateUrl: 'app/observations/details/observationdetails.html',
                controller: 'ObservationDetailsCtrl as vm',
                cache: false,
                params: { observation: null },
                data: {
                    defaultBack: defaultBackHelp,
                    showSettings: false
                }
            })

            .state('observationlist', {
                url: '/observationlist',
                templateUrl: 'app/observations/list/observationlist.html',
                controller: 'ObservationListCtrl as vm',
                data: {
                    defaultBack: defaultBackStart
                }
            })

            //SNØ
            .state('snowregistrationNew', {
                url: '/snowregistration',
                templateUrl: 'app/snow/snowregistration/snowregistration.html',
                controller: 'SnowRegistrationCtrl as vm',
                data: {
                    defaultBack: defaultBackStart,
                    showRegistrationFooter: true
                }
            })
            .state('snowtrip', {
                url: '/snowtrip',
                templateUrl: 'app/snow/trip/trip.html',
                controller: 'TripCtrl as vm',
                data: {
                    defaultBack: defaultBackStart,
                    showTripFooter: true
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
            .state('stabilitytest', {
                //Stabilitetstest
                url: '/stabilitytest',
                templateUrl: 'app/snow/snowregistration/stabilitytest/stabilitytest.html',
                controller: 'SnowStabilityTestCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration,
                    showFormFooter: true,
                    registrationProp: 'CompressionTest'
                }
            })
            .state('avalancheobs', {
                //Skredhendelse
                url: '/avalancheobs',
                templateUrl: 'app/snow/snowregistration/avalancheobs/avalancheobs.html',
                controller: 'AvalancheObsCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration,
                    showFormFooter: true,
                    registrationProp: 'AvalancheObs'
                }
            })
            .state('avalancheactivityobs', {
                //Skredaktivitet
                url: '/avalancheactivityobs',
                templateUrl: 'app/snow/snowregistration/avalancheactivityobs/avalancheactivityobs.html',
                controller: 'AvalancheActivityObsCtrl as vm',
                data: {
                    defaultBack: defaultBackSnowRegistration,
                    showFormFooter: true,
                    registrationProp: 'AvalancheActivityObs2'
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
            .state('iceregistrationNew', {
                url: '/iceregistration',
                templateUrl: 'app/ice/iceregistration/iceregistration.html',
                controller: 'IceRegistrationCtrl as vm',
                data: {
                    defaultBack: defaultBackStart,
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
            .state('waterregistrationNew', {
                url: '/waterregistration',
                templateUrl: 'app/water/waterregistration/waterregistration.html',
                controller: 'WaterRegistrationCtrl as vm',
                data: {
                    defaultBack: defaultBackStart,
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
            .state('dirtregistrationNew', {
                url: '/dirtregistration',
                templateUrl: 'app/dirt/dirtregistration/dirtregistration.html',
                controller: 'DirtRegistrationCtrl as vm',
                data: {
                    defaultBack: defaultBackStart,
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
                    showFormFooter: true,
                    registrationProp: 'GeneralObservation'
                }
            })
            .state('help', {
                url: '/help/:page',
                templateUrl: function (stateParams) {
                    return 'app/help/' + stateParams.page + '.html';
                },
                controller: 'HelpCtrl as vm',
                data: {
                    defaultBack: defaultBackHelp,
                    showSettings: false
                }
            });
    }

    function setup($ionicPlatform, Utility, AppLogging, Registration, Observations, OfflineMap) {
        'ngInject';

        $ionicPlatform.ready(function () {

            if (Utility.hasGoodNetwork() && Utility.shouldUpdateKdvElements()) {
                Utility.refreshKdvElements();
            }

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)*/
            AppLogging.debug('Ionic platform ready');
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                cordova.plugins.Keyboard.disableScroll(true);
            }

            if (window.StatusBar) {
                StatusBar.styleLightContent();
            }

            document.addEventListener("deviceready", function () {
                Observations.removeOldObservationsFromPresistantStorage(); //cleanup old observations on startup
                OfflineMap.checkUncompleteDownloads(); //Check if any uncomplete downloads and continue download progress
            });
        });

        $ionicPlatform.on('resume', function () {
            Registration.setBadge(); //Update badge on app resume
        });
    }
})();
