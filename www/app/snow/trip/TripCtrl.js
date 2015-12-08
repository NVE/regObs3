(function () {
    'use strict';

    function TripCtrl() {
        var vm = this;

        var hour = new Date().getHours();
        var i;
        vm.tripMinutesArray = [];

        for(i = hour+1; i < 25; i++){
            vm.tripMinutesArray.push({
                val:(i-hour)*60,
                name:i+':00'
            });
        }

    }

    angular.module('RegObs')
        .controller('TripCtrl', TripCtrl);

})();
