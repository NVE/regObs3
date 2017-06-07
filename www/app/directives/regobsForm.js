angular.module('RegObs').component('regobsForm', {
    bindings: {
        name: '@',
        saveAction: '&',
        goBack: '<',
        backState: '@'
    },
    controller: function ($state, Property, $scope, RegobsPopup, $ionicHistory, $q) {
        var ctrl = this;
        ctrl.name = ctrl.name || 'regobsform';

        ctrl.formIsInvalid = function () {
            return $scope[ctrl.name].$invalid;
        };

        ctrl.getUserConfirmation = function () {
            return RegobsPopup.delete(
                'INVALID_FORM',
                'INVALID_FORM_TEXT',
                'CONTINUE'
            );
        };

        ctrl.checkFormAndSave = function (event, toState) {
            var callAction = function () {
                if (angular.isFunction(ctrl.saveAction)) {
                    ctrl.saveAction();
                }
            };

            if (ctrl.formIsInvalid()) {
                if (event) {
                    event.preventDefault();
                }
                ctrl.getUserConfirmation()
                    .then(function (confirm) {
                        if (confirm) {
                            Property.reset($state.current.data.registrationProp, true);
                            callAction();
                            $state.go(toState.name, { confirmed: true });
                        }
                    });
            } else {
                callAction();
            }
        };

        ctrl.post = function () {
            if (ctrl.goBack === undefined || ctrl.goBack === true) {             
                if (ctrl.backState) {
                    $state.go(ctrl.backState);
                } else {
                    $ionicHistory.goBack();
                }
            } else {
                ctrl.checkFormAndSave();
            }
        };

        $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (!toParams.confirmed) {
                ctrl.checkFormAndSave(event, toState);
            }
        });
    },
    transclude: true,
    template: '<form name="{{$ctrl.name}}" ng-submit="$ctrl.post()" novalidate><ng-transclude></ng-transclude></form>',
});