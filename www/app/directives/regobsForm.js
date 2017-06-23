angular.module('RegObs').component('regobsForm', {
    bindings: {
        name: '@',
        saveAction: '&?',
        goBack: '<',
        backState: '@'
    },
    controller: function ($state, Property, $scope, RegobsPopup, $ionicHistory, $q, Registration, Pictures, AppLogging) {
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
            if (toState && toState.data && toState.data.skipValidation) {
                return;
            }

            var callAction = function () {
                var errors = $scope[ctrl.name].$error;
                if (errors.required) {
                    //Required elements must be set, otherwhise entire form is invalid!
                    AppLogging.log('required element found! Reset registration prop');
                    var currentProp = ($state.current.data || {}).registrationProp;
                    if (currentProp) {
                        delete Registration.data[currentProp];
                    }
                }

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
            if (ctrl.goBack === false) {
                ctrl.checkFormAndSave();
            } else {               
                if (ctrl.backState) {
                    $state.go(ctrl.backState);
                } else {
                    $ionicHistory.goBack();
                }
            }
        };

        $scope.$on('$stateChangeStart', ctrl.checkFormAndSave);
    },
    transclude: true,
    template: '<form name="{{$ctrl.name}}" ng-submit="$ctrl.post()" novalidate><ng-transclude></ng-transclude></form>',
});