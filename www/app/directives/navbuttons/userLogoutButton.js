angular.module('RegObs').component('userLogoutButton', {
    template: '<button ng-cloak type="button" class="button button-clear ion-locked small-header-button" ng-if="$ctrl.isLoggedIn()" ui-sref="login"></button>',
    controller: function (User) {
        var ctrl = this;
        ctrl.isLoggedIn = function () {
            return !User.getUser().anonymous;
        };
    }
});