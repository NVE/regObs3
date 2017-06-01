angular.module('RegObs').component('navSavingIndicator', {
    template: '<div class="save-indicator" ng-if="$ctrl.showSavedText"><ion-spinner icon="dots" class="save-indicator-spinner"></ion-spinner><span class="save-indicator-text">{{"SAVED"|translate}}</span> <i ng-click="$ctrl.openPopover($event)" class="icon ion-checkmark-circled save-indicator-icon"></i></div>',
    controller: function ($rootScope, $timeout, LocalStorage, $ionicPopover, moment, Utility, $translate) {
        var ctrl = this;
        ctrl.showSavedText = false;

        ctrl.triggerSave = function () {
            LocalStorage.setObject('triggerSave', true);          
        };

        ctrl.openPopover = function ($event) {
            if (ctrl.lastSaved) {
                var dateAndTime = Utility.formatDateAndTime(ctrl.lastSaved);
                var template = '<ion-popover-view class="save-popover"><ion-header-bar><h1 class="title">{{"SAVED"|translate}} ' + dateAndTime +'</h1></ion-header-bar><ion-content>{{"OBSERVATION_SAVED_INFO"|translate}}</ion-content></ion-popover-view>';
                ctrl.popover = $ionicPopover.fromTemplate(template);
                ctrl.popover.show($event);
            }
        };

        ctrl.$onInit = function () {
            var isSaving = LocalStorage.getObject('triggerSave', false);
            if (isSaving) {
                ctrl.showSavedText = true;
                ctrl.lastSaved = Date.now();
                LocalStorage.setObject('triggerSave', false);
            }
        };

        ctrl.$onDestroy = function () {
            if (ctrl.popover){
                ctrl.popover.remove();
            }
        }; 

        $rootScope.$on('$regObs:registrationSaved', ctrl.triggerSave);
        $rootScope.$on('$regObs:obsLocationSaved', ctrl.triggerSave);
    }
});