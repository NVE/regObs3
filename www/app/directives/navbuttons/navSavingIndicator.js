angular.module('RegObs').component('navSavingIndicator', {
    template: '<div class="save-indicator"><span class="save-indicator-text" ng-show="$ctrl.showSavedText">Lagret</span> <i class="icon ion-checkmark-circled save-indicator-icon"></i></div>',
    controller: function (Registration, $rootScope, $timeout) {
        var ctrl = this;
        ctrl.showSavedText = false;
        ctrl.isEmpty = function () {
            return Registration.isEmpty();
        };

        ctrl.triggerSave = function () {
            if (ctrl.timer) {
                $timeout.cancel(ctrl.timer);
            }

            ctrl.showSavedText = true;
            ctrl.timer = $timeout(function () {
                ctrl.showSavedText = false;
            }, 2000);
        };

        ctrl.$onInit = ctrl.triggerSave;

        $rootScope.$on('$regObs:registrationSaved', ctrl.triggerSave);
        $rootScope.$on('$regObs:obsLocationSaved', ctrl.triggerSave);

        ctrl.$onDestroy = function () {
            if (ctrl.timer) {
                $timeout.cancel(ctrl.timer);
            }
        };
    }
});