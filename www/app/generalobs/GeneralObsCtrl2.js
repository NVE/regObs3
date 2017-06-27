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
            }, function (error) {
                AppLogging.log('Error getting picture: ' + (error && error.message ? error.message : ''));
            });
        };

        vm.getPictures = function () {
            return Pictures.getPictures(vm.registrationProp);
        };

        vm.removeImage = function (picture) {
            Pictures.deletePicture(picture);
        };

        vm.reset = function () {
            Property.reset(vm.registrationProp);
        };

        $scope.$on('$ionicView.loaded', init.bind(this));
    });
