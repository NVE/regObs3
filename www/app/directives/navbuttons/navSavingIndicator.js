angular.module('RegObs').component('navSavingIndicator', {
    template: '<div class="save-indicator" ng-if="$ctrl.showSavedText"><ion-spinner icon="dots" class="save-indicator-spinner"></ion-spinner><span class="save-indicator-text">{{"SAVED"|translate}} <i class="icon ion-checkmark-circled save-indicator-icon"></i></span></div>',
    controller: function ($rootScope, $timeout, LocalStorage) {
        var ctrl = this;
        ctrl.showSavedText = false;

        ctrl.triggerSave = function () {
            LocalStorage.setObject('triggerSave', true);          
        };

        ctrl.$onInit = function () {
            var isSaving = LocalStorage.getObject('triggerSave', false);
            if (isSaving) {
                ctrl.showSavedText = true;
                LocalStorage.setObject('triggerSave', false);
            }
        };

        $rootScope.$on('$regObs:registrationSaved', ctrl.triggerSave);
        $rootScope.$on('$regObs:obsLocationSaved', ctrl.triggerSave);
    }
});