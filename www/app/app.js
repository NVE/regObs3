(function () {
    "use strict";

    angular.module('RegObs', ['ionic', 'ngCordova', 'ion-floating-menu', 'angularProgressbar', 'pascalprecht.translate', 'ngWebworker'])
        .config(providers)
        .run(setup);

    function providers($provide, $stateProvider, $urlRouterProvider, $ionicConfigProvider, AppSettingsProvider, $translateProvider, UserProvider, UtilityProvider) {
        'ngInject';

        var utils = UtilityProvider.$get();
        if (!utils.isRippleEmulator()) {
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
        }


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


        if (!AppSettingsProvider.$get().hasSetAppMode()) {
            $urlRouterProvider.otherwise('/wizard');
        } else {
            $urlRouterProvider.otherwise('/start');
        }

        $ionicConfigProvider.backButton.previousTitleText(false).text('&emsp;&emsp;'); //Increase the touch target area on back button

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
                controller: 'MapStartCtrl as vm'
            })
            .state('settings', {
                url: '/settings',
                templateUrl: 'app/settings/settingsview.html',
                controller: 'SettingsViewCtrl as vm'
            })
            .state('offlinemapoverview', {
                url: '/offlinemapoverview',
                templateUrl: 'app/map/offlinemapoverview.html',
                controller: 'OfflineMapOverviewCtrl as vm'
            })
            .state('mapareadownload', {
                url: '/mapareadownload',
                templateUrl: 'app/map/mapareadownload.html',
                controller: 'MapAreaDownloadCtrl as vm',
                cache: false
            })
            .state('offlineareadetails', {
                url: '/offlineareadetails',
                templateUrl: 'app/map/offlineareadetails.html',
                controller: 'OfflineAreaDetailsCtrl as vm',
                cache: false,
                params: { area: null }
            })

            .state('observationdetails', {
                url: '/observationdetails',
                templateUrl: 'app/observations/details/observationdetails.html',
                controller: 'ObservationDetailsCtrl as vm',
                cache: false,
                params: { observation: null }
            })

            .state('observationlist', {
                url: '/observationlist',
                templateUrl: 'app/observations/list/observationlist.html',
                controller: 'ObservationListCtrl as vm'
            })

            .state('confirmlocation', {
                url: '/confirmlocation',
                templateUrl: 'app/registration/location/confirmlocation.html',
                controller: 'ConfirmLocationCtrl as vm'
            })

            .state('confirmtime', {
                url: '/confirmtime',
                templateUrl: 'app/registration/time/confirmtime.html',
                controller: 'ConfirmTimeCtrl as vm'
            })

            .state('newregistration', {
                url: '/newregistration',
                templateUrl: 'app/registration/registration.html',
                controller: 'RegistrationCtrl as vm'
            })


            //SNØ
            .state('snowtrip', {
                url: '/snowtrip',
                templateUrl: 'app/snow/trip/trip.html',
                controller: 'TripCtrl as vm'
            })
            .state('snowdangerobs', {
                //Faretegn
                url: '/snowdangerobs',
                templateUrl: 'app/snow/snowregistration/snowdangerobs/snowdangerobs.html',
                controller: 'SnowDangerObsCtrl as vm',
                data: {
                    registrationProp: 'DangerObs'
                }
            })
            .state('stabilitytest', {
                //Stabilitetstest
                url: '/stabilitytest',
                templateUrl: 'app/snow/snowregistration/stabilitytest/stabilitytest.html',
                controller: 'SnowStabilityTestCtrl as vm',
                data: {
                    registrationProp: 'CompressionTest'
                }
            })
            .state('avalancheobs', {
                //Skredhendelse
                url: '/avalancheobs',
                templateUrl: 'app/snow/snowregistration/avalancheobs/avalancheobs.html',
                controller: 'AvalancheObsCtrl as vm',
                data: {
                    registrationProp: 'AvalancheObs'
                }
            })
            .state('avalancheactivityobs', {
                //Skredaktivitet
                url: '/avalancheactivityobs',
                templateUrl: 'app/snow/snowregistration/avalancheactivityobs/avalancheactivityobs.html',
                controller: 'AvalancheActivityObsCtrl as vm',
                data: {
                    registrationProp: 'AvalancheActivityObs2'
                }
            })
            .state('snowweatherobservation', {
                //Vær
                url: '/snowweatherobservation',
                templateUrl: 'app/snow/snowregistration/snowweatherobservation/snowweatherobservation.html',
                controller: 'SnowWeatherObservationCtrl as vm',
                data: {
                    registrationProp: 'WeatherObservation'
                }
            })
            .state('snowsurfaceobservation', {
                //Snødekke
                url: '/snowsurfaceobservation',
                templateUrl: 'app/snow/snowregistration/snowsurfaceobservation/snowsurfaceobservation.html',
                controller: 'SnowSurfaceObservationCtrl as vm',
                data: {
                    registrationProp: 'SnowSurfaceObservation'
                }
            })
            .state('snowprofile', {
                //Snøprofil
                url: '/snowprofile',
                templateUrl: 'app/snow/snowregistration/snowprofile/snowprofile.html',
                controller: 'SnowProfileCtrl as vm',
                data: {
                    registrationProp: 'SnowProfile'
                }
            })
            .state('avalancheevalproblem', {
                //Skredproblem
                url: '/avalancheevalproblem',
                templateUrl: 'app/snow/snowregistration/avalancheevalproblem/avalancheevalproblem.html',
                controller: 'AvalancheEvalProblemCtrl as vm',
                data: {
                    registrationProp: 'AvalancheEvalProblem2'
                }
            })
            .state('avalancheevaluation', {
                //Skredfarevurdering
                url: '/avalancheevaluation',
                templateUrl: 'app/snow/snowregistration/avalancheevaluation/avalancheevaluation.html',
                controller: 'AvalancheEvaluationCtrl as vm',
                data: {
                    registrationProp: 'AvalancheEvaluation3'
                }
            })

            //IS
            .state('icedangerobs', {
                //Faretegn
                url: '/icedangerobs',
                templateUrl: 'app/ice/iceregistration/icedangerobs/icedangerobs.html',
                controller: 'IceDangerObsCtrl as vm',
                data: {
                    registrationProp: 'DangerObs'
                }
            })
            .state('icecoverobs', {
                //Isdekningsgrad
                url: '/icecoverobs',
                templateUrl: 'app/ice/iceregistration/icecoverobs/icecoverobs.html',
                controller: 'IceCoverObsCtrl as vm',
                data: {
                    registrationProp: 'IceCoverObs'
                }
            })
            .state('icethickness', {
                //Istykkelse
                url: '/icethickness',
                templateUrl: 'app/ice/iceregistration/icethickness/icethickness.html',
                controller: 'IceThicknessCtrl as vm',
                data: {
                    registrationProp: 'IceThickness'
                }
            })
            .state('iceincident', {
                //Ulykke/hendelse
                url: '/iceincident',
                templateUrl: 'app/ice/iceregistration/iceincident/iceincident.html',
                controller: 'IceIncidentCtrl as vm',
                data: {
                    registrationProp: 'Incident'
                }
            })

            //VANN
            .state('waterdangerobs', {
                //Faretegn
                url: '/waterdangerobs',
                templateUrl: 'app/water/waterregistration/waterdangerobs/waterdangerobs.html',
                controller: 'WaterDangerObsCtrl as vm',
                data: {
                    registrationProp: 'DangerObs'
                }
            })
            .state('waterlevel', {
                //Faretegn
                url: '/waterlevel',
                templateUrl: 'app/water/waterregistration/waterlevel/waterlevel.html',
                controller: 'WaterLevelCtrl as vm',
                data: {
                    registrationProp: 'WaterLevel2'
                }
            })
            .state('waterincident', {
                //Faretegn
                url: '/waterincident',
                templateUrl: 'app/water/waterregistration/waterincident/waterincident.html',
                controller: 'WaterIncidentCtrl as vm',
                data: {
                    registrationProp: 'Incident'
                }
            })

            //JORD
            .state('dirtdangerobs', {
                //Faretegn
                url: '/dirtdangerobs',
                templateUrl: 'app/dirt/dirtregistration/dirtdangerobs/dirtdangerobs.html',
                controller: 'DirtDangerObsCtrl as vm',
                data: {
                    registrationProp: 'DangerObs'
                }
            })
            .state('landslideobs', {
                //Skredhendelse
                url: '/landslideobs',
                templateUrl: 'app/dirt/dirtregistration/landslideobs/landslideobs.html',
                controller: 'LandSlideObsCtrl as vm',
                data: {
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
                    registrationProp: 'GeneralObservation'
                }
            })
            .state('help', {
                url: '/help/:page',
                templateUrl: function (stateParams) {
                    return 'app/help/' + stateParams.page + '.html';
                },
                controller: 'HelpCtrl as vm'
            });
    };

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
                Registration.clearNewRegistrations();
                Observations.removeOldObservationsFromPresistantStorage(); //cleanup old observations on startup
                OfflineMap.checkUncompleteDownloads(); //Check if any uncomplete downloads and continue download progress
            });
        });

        $ionicPlatform.on('resume', function () {
            Registration.setBadge(); //Update badge on app resume
        });
    }
})();
