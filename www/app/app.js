"use strict";

angular.module('RegObs', ['ionic','ngResource'])

    .controller('AppCtrl', function($scope, $ionicModal, Localization){
        var appVm = this;

        $scope.$on('$ionicView.loaded', function() {
            $ionicModal.fromTemplateUrl('app/settings/settings.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                appVm.modal = modal;
            });
            appVm.openModal = function() {
                appVm.modal.show();
            };
            appVm.closeModal = function() {
                appVm.modal.hide();
            };
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
