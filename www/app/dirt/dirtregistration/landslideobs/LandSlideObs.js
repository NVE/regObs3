angular
    .module('RegObs')
    .controller('LandSlideObsCtrl', function ($scope, $state,$ionicModal, Registration) {
        var vm = this;
        vm.dateArray = [
            { "Val": 0, "Name": "Ikke gitt" },
            { "Val": 1, "Name": "Innen 1 time" },
            { "Val": 6, "Name": "Innen 6 timer" },
            { "Val": 24, "Name": "Innen 24 timer" },
            { "Val": 168, "Name": "Innen 1 uke" },
            { "Val": 672, "Name": "Innen 1 mnd" }
        ];

        var loadModal = function () {
            var url = 'app/dirt/dirtregistration/landslideobs/landslideMapModal.html';
            return $ionicModal
                .fromTemplateUrl(url, {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    vm.modal = modal;
                    return modal;
                });
        };

        loadModal();

        vm.setLandslideInMap = function () {
            vm.modal.hide();
            $scope.$broadcast('setLandslideInMap');
        };

        vm.openLandslideInMap = function () {
            vm.modal.show();
            $scope.$broadcast('openLandslideInMap');
        };

        vm.dateChanged = function () {
            if(vm.date && vm.dateAccuracy){
                var start = vm.date.getTime() - (vm.dateAccuracy*18e5);
                var end = vm.date.getTime() + (vm.dateAccuracy*18e5);
                vm.reg.LandSlideObs.DtLandSlideTime = new Date(start).toISOString();
                vm.reg.LandSlideObs.DtLandSlideTimeEnd = new Date(end).toISOString();
            }
            console.log(vm.reg.LandSlideObs);
        };

        $scope.$on('$ionicView.loaded', function(){
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);

            if(vm.reg.LandSlideObs.DtLandSlideTime && vm.reg.LandSlideObs.DtLandSlideTimeEnd){
                var start = new Date(vm.reg.LandSlideObs.DtLandSlideTime);
                var end = new Date(vm.reg.LandSlideObs.DtLandSlideTimeEnd);
                var dt = end - start;
                vm.dateAccuracy = dt/36e5;
                vm.date = new Date(start.getTime() + (dt/2));
            }
        });
    });
