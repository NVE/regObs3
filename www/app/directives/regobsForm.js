angular.module('RegObs').component('regobsForm', {
    bindings: {
        name: '@',
        saveAction: '&?',
        goBack: '<',
        backState: '@'
    },
    controller: function ($state, Property, $scope, RegobsPopup, $ionicHistory, $q, Registration, Pictures) {
        var ctrl = this;
        ctrl.name = ctrl.name || 'regobsform';
        ctrl._confirmed = false;

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

        ctrl.checkFormAndSave = function (event, toState, toParams, fromState, fromParams) {
            if (ctrl._confirmed) {
                return;
            }

            if ($state.current.data.registrationProp && !Registration.propertyExists($state.current.data.registrationProp) && !Pictures.hasPictures($state.current.data.registrationProp)) {
                return; //Do not save empty registration, because it is cleaned up in AppCtrl
            }

            var callAction = function () {
                if (angular.isFunction(ctrl.saveAction)) {
                    ctrl.saveAction();
                } else {
                    Registration.save();
                }
            };

            if (ctrl.formIsInvalid()) {
                if (event) {
                    event.preventDefault();
                }
                ctrl.getUserConfirmation()
                    .then(function (confirm) {
                        if (confirm) {
                            ctrl._confirmed = true;
                            callAction();
                            $state.go(toState.name, toParams);
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

        $scope.$on('$stateChangeStart', ctrl.checkFormAndSave);
    },
    transclude: true,
    template: '<form name="{{$ctrl.name}}" ng-submit="$ctrl.post()" novalidate><ng-transclude></ng-transclude></form>',
});