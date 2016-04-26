angular
    .module('RegObs')
    .controller('LandSlideObsCtrl', function ($scope, $state,$ionicModal, Registration) {
        var vm = this;


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


        $scope.$on('$ionicView.loaded', function(){
            var start,end,dt;
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);

        });
    });
