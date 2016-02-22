angular
    .module('RegObs')
    .controller('AvalancheObsCtrl', function ($scope, $ionicModal, Registration) {
        var vm = this;

        var loadModal = function () {
            var url = 'app/snow/snowregistration/avalancheobs/avalancheMapModal.html';
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

        vm.expoArray = Registration.getExpositionArray();
        vm.heightArray = [
            2500, 2400, 2300, 2200, 2100,
            2000, 1900, 1800, 1700, 1600,
            1500, 1400, 1300, 1200, 1100,
            1000, 900, 800, 700, 600,
            500, 400, 300, 200, 100, 0
        ];


        vm.setLandslideInMap = function () {
            vm.modal.hide();
            $scope.$broadcast('setLandslideInMap');
        };

        vm.openLandslideInMap = function () {
            vm.modal.show();
            $scope.$broadcast('openLandslideInMap');
        };

        $scope.$on('$ionicView.loaded', function(){

            if(!vm.reg) vm.reg = Registration.initPropertyAsObject("AvalancheObs");

        });
    });

