angular.module('RegObs').component('regobsForm', {
    bindings: {
        name: '@',
        saveAction: '&',
        goBack: '<',
    },
    controller: function ($state, Property, $scope, RegobsPopup, $ionicHistory, $q) {
        var ctrl = this;

        var confirmed = false;
        ctrl.name = ctrl.name || 'regobsform';

        ctrl.formIsInvalid = function () {
            return $scope[ctrl.name].$invalid && Property.exists($state.current.data.registrationProp);
        };

        ctrl.getUserConfirmation = function () {
            return RegobsPopup.delete(
                'INVALID_FORM',
                'INVALID_FORM_TEXT',
                'CONTINUE'
            );
        };

        ctrl.checkFormAndSave = function (event, toSate) {
            var complete = function () {
                confirmed = true;
                if (toSate) {
                    $state.go(toSate);
                }
            };

            var callAction = function () {
                if (angular.isFunction(ctrl.saveAction)) {
                    var result = ctrl.saveAction();
                    if (result && angular.isFunction(result.then)) {
                        result.then(function () {
                            complete();
                        });
                    } else {
                        complete();
                    }
                } else {
                    complete();
                }
            };

            if (ctrl.formIsInvalid() && !confirmed) {
                if (event) {
                    event.preventDefault();
                }
                ctrl.getUserConfirmation()
                    .then(function (confirm) {
                        if (confirm) {
                            confirmed = true;
                            Property.reset($state.current.data.registrationProp, true);
                            callAction();
                        }
                    });
            } else if (!confirmed) {
                callAction();
            }
        };

        ctrl.post = function () {
            if (ctrl.goBack === undefined || ctrl.goBack === true) {
                $ionicHistory.goBack();
            } else {
                ctrl.checkFormAndSave();
            }
        };



        $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            ctrl.checkFormAndSave(event, toState.name);
        });
    },
    transclude: true,
    template: '<form name="{{$ctrl.name}}" ng-submit="$ctrl.post()" novalidate><ng-transclude></ng-transclude></form>',
});