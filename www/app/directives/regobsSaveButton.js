(function () {
    'use strict';

    var regobsSaveButton = {
        bindings: {
            saveAction: '&',
            goBack: '<'
        },
        require: {
            formCtrl: '?^form'
        },
        template: '<button class="button button-block button-calm" ng-click="$ctrl.save()">Lagre</button>',
        controller: function ($scope, $state, $ionicPlatform, $ionicHistory, Property, RegobsPopup, AppLogging, $document, $element) {
            'ngInject';
            var ctrl = this;
            var backState;
            var confirmed = false;

            ctrl.save = function () {
                confirmed = false;
                AppLogging.log('formCtrl', ctrl.formCtrl);
                if (formIsInvalid()) {
                    getUserConfirmation()
                        .then(saveAndGoBack);
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
                if (toState.name === backState && formIsInvalid() && !confirmed) {
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
                } else {
                    ctrl.saveAction();
                }
            });

            $ionicPlatform.registerBackButtonAction(function (event) {
                ctrl.save();
            }, 101);

            var stopRKey = function (evt) {
                var node = (evt.target) ? evt.target :
                                         ((evt.srcElement) ? evt.srcElement : null);
                if ((evt.keyCode === 13) && (node.type === "number")) {
                    evt.preventDefault();
                }
            };

            ctrl.$onInit = function () {
                backState = $state.current.data.defaultBack.state;
                $document.on('keydown', stopRKey);
            };

            ctrl.$onDestroy = function () {
                $document.off('keydown', stopRKey);
            }

        }
    };

    angular
        .module('RegObs')
        .component('regobsSaveButton', regobsSaveButton);

})();
