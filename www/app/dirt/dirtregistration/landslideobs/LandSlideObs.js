angular
    .module('RegObs')
    .controller('LandSlideObsCtrl', function ($scope, $state, Registration) {
        var vm = this;
        vm.dateArray = [
            { "Val": 0, "Name": "Ikke gitt" },
            { "Val": 1, "Name": "Innen 1 time" },
            { "Val": 6, "Name": "Innen 6 timer" },
            { "Val": 24, "Name": "Innen 24 timer" },
            { "Val": 168, "Name": "Innen 1 uke" },
            { "Val": 672, "Name": "Innen 1 mnd" }
        ];
        vm.dateChanged = function () {
            if(vm.date && vm.dateAccuracy){
                var start = vm.date.getTime() - (vm.dateAccuracy*18e5);
                var end = vm.date.getTime() + (vm.dateAccuracy*18e5);
                vm.obs.DtLandSlideTime = new Date(start).toISOString();
                vm.obs.DtLandSlideTimeEnd = new Date(end).toISOString();
            }
            console.log(vm.obs);
        };

        $scope.$on('$ionicView.loaded', function(){
            vm.obs = Registration.getPropertyAsObject($state.current.data.registrationProp);

            if(vm.obs.DtLandSlideTime && vm.obs.DtLandSlideTimeEnd){
                var start = new Date(vm.obs.DtLandSlideTime);
                var end = new Date(vm.obs.DtLandSlideTimeEnd);
                var dt = end - start;
                vm.dateAccuracy = dt/36e5;
                vm.date = new Date(start.getTime() + (dt/2));
            }
        });
    });
