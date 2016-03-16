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
        controller: function ($scope, $state, $ionicPlatform, $ionicHistory, RegobsPopup) {
            var ctrl = this;
            var backState;
            var confirmed = false;

            ctrl.save = function () {
                confirmed = false;
                console.log('formCtrl', ctrl.formCtrl);
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
                    'Skjema har mangler',
                    'Hvis du fortsetter, kan du miste verdier du har skrevet inn. Avbryt for å rette markerte felter.',
                    'OK'
                )
            }

            function formIsInvalid() {
                return ctrl.formCtrl && ctrl.formCtrl.$invalid;
            }

            $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                if (toState.name === backState && formIsInvalid() && !confirmed) {
                    event.preventDefault();
                    getUserConfirmation()
                        .then(function (confirm) {
                            if (confirm) {
                                confirmed = true;
                                ctrl.saveAction();
                                $state.go(toState.name);
                            }
                        });
                } else {
                    ctrl.saveAction();
                }
            });

            $ionicPlatform.registerBackButtonAction(function (event) {
                ctrl.save();
            }, 101);

            ctrl.$onInit = function () {
                backState = $state.current.data.defaultBack.state;

            };

        }
    };

    angular
        .module('RegObs')
        .component('regobsSaveButton', regobsSaveButton);

})();
