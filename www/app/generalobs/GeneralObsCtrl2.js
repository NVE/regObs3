angular
    .module('RegObs')
    .controller('GeneralObsCtrl2', function ($scope, $state, Registration, Pictures, $ionicScrollDelegate, Property, Utility, AppLogging) {
        var vm = this;

        var init = function () {
            vm.registrationProp = $state.current.data.registrationProp;
            vm.reg = Registration.initPropertyAsObject(vm.registrationProp);
        }

        vm.addPicture = function () {
            Pictures.showImageSelector(Utility.registrationTid(vm.registrationProp)).then(function (result) {
                Pictures.addPicture(vm.registrationProp, result.PictureImageBase64);
                $ionicScrollDelegate.resize();
            }, function (error) {
                AppLogging.log('Error getting picture: ' + (error && error.message ? error.message : ''));
            });
        };

        vm.reset = function () {
            Property.reset(vm.registrationProp);
        };

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
