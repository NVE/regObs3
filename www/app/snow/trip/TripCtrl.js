(function () {
    'use strict';

    function TripCtrl(Trip, $scope, RegobsPopup, $ionicHistory) {
        var vm = this;

        vm.trip = Trip;

        var now = new Date();
        var hour = now.getHours();
        var i;
        vm.tripMinutesArray = [];

        for(i = hour+1; i < 25; i++){
            vm.tripMinutesArray.push({
                val:i*60,
                name:i+':00'
            });
        }

        function resetForm(confirm) {
            if (confirm) {
                vm.tripId = undefined;
                vm.tripMinutes = undefined;
                vm.tripComment = undefined;
            }
        }

        vm.resetTrip = function () {
            if (vm.tripId || vm.tripMinutes || vm.tripComment)
                RegobsPopup.delete('Nullstill', 'Vil du nullstille skjema?', 'Nullstill')
                    .then(resetForm);

        };

        vm.startTrip = function (id, expectedMinutes, comment) {
            Trip.start(10, id, expectedMinutes, comment);
        };

        vm.stopTrip = function () {
            Trip.stop().then(resetForm);
        };

        $scope.$on('$regobs.tripStarted', function () {
            resetForm(true);
            RegobsPopup.alert('Tur startet', 'Tur startet!')
                .then(function () {
                    $ionicHistory.goBack();
                });
        });

    }

    angular.module('RegObs')
        .controller('TripCtrl', TripCtrl);

})();
