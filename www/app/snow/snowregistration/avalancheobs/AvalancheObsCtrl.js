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

