(function () {
    'use strict';

    function TripCtrl() {
        var vm = this;

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
        console.log('Trip Array', vm.tripMinutesArray);

    }

    angular.module('RegObs')
        .controller('TripCtrl', TripCtrl);

})();
