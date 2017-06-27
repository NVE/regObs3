angular.module('RegObs').component('navTripButton', {
    template: '<button ng-cloak type="button" ng-if="$ctrl.started" class="button button-balanced button-clear small-header-button" ng-class="{\'ion-android-walk\':!$ctrl.sending}" ng-click="$ctrl.stopTrip()"><ion-spinner ng-if="$ctrl.sending" class="spinner-light" ></ion-spinner></button>',
    controller: function (Trip, $rootScope) {
        var ctrl = this;
        ctrl.started = Trip.model.started;
        ctrl.sending = Trip.sending;

        ctrl.stopTrip = function () {
            Trip.stop();
        };

        $rootScope.$on('$regobs.tripStarted', function () {
            ctrl.sending = false;
            ctrl.started = true;
        });

        $rootScope.$on('$regobs.tripSending', function () {
            ctrl.sending = true;
        });

        $rootScope.$on('$regobs.tripStopped', function () {
            ctrl.sending = false;
            ctrl.started = false;
        });
    }
});