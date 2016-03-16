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

        vm.expoArray = [
            {
                name: 'N',
                val: '10000000'
            },
            {
                name: 'NØ',
                val: '01000000'
            },
            {
                name: 'Ø',
                val: '00100000'
            },
            {
                name: 'SØ',
                val: '00010000'
            },
            {
                name: 'S',
                val: '00001000'
            },
            {
                name: 'SV',
                val: '00000100'
            },
            {
                name: 'V',
                val: '00000010'
            },
            {
                name: 'NV',
                val: '00000001'
            }
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

