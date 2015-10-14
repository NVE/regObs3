"use strict";

angular.module('RegObs', ['ionic'])

    .controller('AppCtrl', function($scope, $ionicModal, Localization, AppSettings, User){
        var appVm = this;

        $scope.$on('$ionicView.loaded', function() {
            appVm.user = User.getUser();
            appVm.settings = AppSettings;

            appVm.logIn = function () {
                User.logIn(appVm.username, appVm.password).then(function() {
                    appVm.user = User.getUser();
                });
            };

            appVm.logOut = function () {
                appVm.username = '';
                appVm.password = '';
                User.logOut();
                appVm.user = User.getUser();
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
