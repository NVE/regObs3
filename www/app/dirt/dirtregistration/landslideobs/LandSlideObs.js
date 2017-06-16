angular
    .module('RegObs')
    .controller('LandSlideObsCtrl', function ($scope, $state, $ionicModal, Registration, Utility, RegobsPopup) {
        var vm = this;

        var init = function() {
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);
        };

        init();

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

        vm._checkTime = function (prop) {
            if (vm.reg && vm.reg.DtObsTime && prop) {
                var isSame = moment(prop).isSame(vm.reg.DtObsTime, 'day');
                if (!isSame) {
                    RegobsPopup.alert('WARNING', 'WARNING_TIME_TEXT');
                }
            }
        };

        vm.checkDtLandSlideTime = function () {
            vm._checkTime(vm.reg.LandSlideObs.DtLandSlideTime);
        };

        vm.checkDtLandSlideTimeEnd = function () {
            vm._checkTime(vm.reg.LandSlideObs.DtLandSlideTimeEnd);
        };


        $scope.$on('$ionicView.loaded', function() {
            init();
        });
    });
