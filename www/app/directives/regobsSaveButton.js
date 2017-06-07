(function () {
    'use strict';

    var regobsSaveButton = {
        bindings: {
            saveAction: '&',
            goBack: '<',
            saveText: '@'
        },
        require: {
            formCtrl: '?^form'
        },
        template: '<button type="button" class="button button-block button-calm" ng-click="$ctrl.save()">{{($ctrl.saveText ? $ctrl.saveText : "SAVE")|translate}}</button>',
        controller: function ($scope, $state, $ionicPlatform, $ionicHistory, Property, RegobsPopup, AppLogging) {
            'ngInject';
            var ctrl = this;
            var backState;
            var confirmed = false;

            ctrl.save = function () {
                confirmed = false;
                AppLogging.log('formCtrl', ctrl.formCtrl);
                if (formIsInvalid()) {
                    getUserConfirmation()
                        .then(function (confirmed) {
                            if (confirmed) {
                                Property.reset($state.current.data.registrationProp, true);
                                saveAndGoBack(true);
                            }
                        });
                } else {
                    saveAndGoBack(true);
                }
            };

            function saveAndGoBack(confirm) {
                if (confirm) {
                    confirmed = true;
                    ctrl.saveAction();
                    if(ctrl.goBack) {
                        $ionicHistory.goBack();
                    }
                }
            }

            function getUserConfirmation() {
                return RegobsPopup.delete(
                    'Skjema har feil eller mangler',
                    'Hvis du fortsetter, mister du verdier du har skrevet inn. Aktuelle felter er markert i rødt. Vil du fortsette?',
                    'Fortsett'
                )
            }

            function formIsInvalid() {
                return ctrl.formCtrl && ctrl.formCtrl.$invalid;
            }

            $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                if (formIsInvalid() && !confirmed) {
                    event.preventDefault();
                    $state.go(fromState.name);
                    getUserConfirmation()
                        .then(function (confirm) {
                            if (confirm) {
                                confirmed = true;
                                Property.reset($state.current.data.registrationProp, true);
                                ctrl.saveAction();
                                $state.go(toState.name);
                            } else {
                                $state.go($state.current, {}, {reload: true});

                            }
                        });
                } else if (!confirmed) {
                    ctrl.saveAction();
                }
            });

            $ionicPlatform.registerBackButtonAction(function (event) {
                ctrl.save();
            }, 101);

            ctrl.$onInit = function () {
                var defaultBack = $state.current.data.defaultBack;
                backState = defaultBack ? defaultBack.state : 'start';
            };

        }
    };

    angular
        .module('RegObs')
        .component('regobsSaveButton', regobsSaveButton);

})();
