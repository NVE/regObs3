angular.module('RegObs').component('userLogoutButton', {
    template: '<button ng-cloak type="button" class="button button-clear ion-locked" ng-show="$ctrl.isLoggedIn()" ui-sref="settings"></button>',
    controller: function (User) {
        var ctrl = this;
        ctrl.isLoggedIn = function () {
            return !User.getUser().anonymous;
        };
    }
});