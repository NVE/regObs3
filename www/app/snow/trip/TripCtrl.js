(function () {
    'use strict';

    function TripCtrl(Trip, $scope, RegobsPopup, $ionicHistory, $q) {
        var vm = this;

        vm.trip = Trip;

        var now = new Date();
        var hour = now.getHours();
        var i;
        vm.tripMinutesArray = [];
        vm.sending = false;

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
                RegobsPopup.delete('CLEAR', 'CLEAR_FORM_TEXT', 'CLEAR')
                    .then(resetForm);

        };

        vm.startTrip = function (id, expectedMinutes, comment) {
            vm.sending = true;
            vm.cancelPromise = $q.defer();
            Trip.start(10, id, expectedMinutes, comment, vm.cancelPromise).then(function () {
                vm.sending = false;
                if (Trip.model.started) {
                    resetForm(true);
                    RegobsPopup.alert('TRIP_STARTED', 'TRIP_STARTED')
                        .then(function () {
                            $ionicHistory.goBack();
                        });
                }
            });
        };

        vm.cancel = function () {
            if (vm.cancelPromise) {
                vm.cancelPromise.resolve();
            };
        };

        vm.stopTrip = function () {
            Trip.stop().then(resetForm);
        };

        //$scope.$on('$regobs.tripStarted', function () {
        //    resetForm(true);
        //    vm.sending = false;
        //    RegobsPopup.alert('Tur startet', 'Tur startet!')
        //        .then(function () {
        //            $ionicHistory.goBack();
        //        });
        //});

        $scope.$on('$ionicView.beforeLeave', function () {
            if (vm.cancelPromise) {
                vm.cancelPromise.resolve();
            }
        });

    }

    angular.module('RegObs')
        .controller('TripCtrl', TripCtrl);

})();
