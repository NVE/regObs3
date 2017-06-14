angular.module('RegObs').component('navMoreButton', {
    template: '<button class="button button-icon ion-more" ng-click="$ctrl.openTopPopover($event)"></button>',
    controller: function (User, $ionicPopover, AppSettings, $rootScope, $state) {
        var ctrl = this;
        ctrl.openTopPopover = function ($event) {
            if (ctrl.topPopover) {
                ctrl.topPopover.show($event);
            }
        };

        ctrl.$onInit = function () {
            var popoverScope = $rootScope.$new();
            popoverScope.currentAppMode = AppSettings.getAppMode();
            popoverScope.goToSettings = function () {
                ctrl.topPopover.hide();
                $state.go('settings');
            };
            popoverScope.changeAppMode = function (mode) {
                ctrl.topPopover.hide();
                AppSettings.setAppMode(mode);
            };
            popoverScope.isLoggedIn = function () {
                return !User.getUser().anonymous;
            };

            $ionicPopover.fromTemplateUrl('app/menus/topPopover.html', { scope: popoverScope }).then(function (popover) {
                ctrl.topPopover = popover;
            });
        };

        ctrl.$onDestroy = function () {
            if (ctrl.topPopover) {
                ctrl.topPopover.remove();
            }
        };
    }
});