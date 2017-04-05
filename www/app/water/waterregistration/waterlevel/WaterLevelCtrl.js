angular
    .module('RegObs')
    .controller('WaterLevelCtrl', function ($scope, $state, Registration, $ionicPopup, Property, AppLogging, moment, Pictures, Utility, $cordovaCamera, AppSettings) {

        var vm = this;

        //var prevChoice;

        //vm.resetModel = function () {
        //    if(!vm.reg.WaterLevelChoice){
        //        vm.reg.WaterLevelChoice = prevChoice;
        //    } else {
        //        prevChoice = vm.reg.WaterLevelChoice;
        //    }

        //    if(vm.reg.WaterLevel.MeasuredDischarge){
        //        delete vm.reg.WaterLevel.MeasuredDischarge;
        //    }
        //    delete vm.reg.WaterLevel.WaterLevelRefTID;
        //};

        

        vm.addWaterLevelMeasurement = function () {
            vm.reg.WaterLevel2.WaterLevelMeasurement.push({});
        };

        vm.removeImage = function (waterlevel, index) {
            if (waterlevel.Pictures && waterlevel.Pictures.length > index) {
                waterlevel.Pictures.splice(index, 1);
            }
        };

        vm.addWaterLevelCameraPicture = function (waterLevel) {
            return $cordovaCamera
                .getPicture(Pictures.defaultCameraOptions())
                .then(function (imageUri) {
                    Registration.initPropertyAsArray('Picture');
                    var pic = {
                        RegistrationTID: Utility.registrationTid($state.current.data.registrationProp),
                        PictureImageBase64: imageUri,
                        PictureComment: ''
                    };
                    
                    waterLevel.Pictures.push(pic);
                    //image.src = "data:image/jpeg;base64," + imageData;
                    if (AppSettings.data.compass) {
                        Pictures.setOrientation(pic);
                    }

                    //if (!waterLevel.DtMeasurementTime) {
                    //    vm.setToNow(waterLevel);
                    //}

                }, function (err) {
                    // error
                    AppLogging.log('Cold not get camera picture');
                    return null;
                });
        };

        vm.addWaterLevelPicture = function (waterLevel) {
            if (!waterLevel.Pictures) {
                waterLevel.Pictures = [];
            }
            $ionicPopup.confirm({
                title: 'Legg til bilde',
                template: 'Vil du legge til eksisterende bilde fra album eller ta nytt med kameraet?',
                buttons: [
                    {
                        text: 'Album',
                        type: 'button icon-left ion-images',
                        onTap: function (e) {
                            // Returning a value will cause the promise to resolve with the given value.
                            return false;
                        }
                    },
                    {
                        text: 'Kamera',
                        type: 'button icon-left ion-camera',
                        onTap: function (e) {
                            // Returning a value will cause the promise to resolve with the given value.
                            return true;
                        }
                    }
                ]
            }).then(function (result) {
                if (result) {
                    if (window.Camera) {
                        vm.addWaterLevelCameraPicture(waterLevel);
                    } else {
                        AppLogging.error('Camera plugin not found!');
                    }
                }
            });
        };

        vm.reset = function () {
            vm.reg.WaterLevel2.WaterLevelMeasurement = [{}];
            Property.reset($state.current.data.registrationProp);          
        };

        vm.removeMeasurement = function (index) {
            if (vm.reg.WaterLevel2.WaterLevelMeasurement.length > 1) {
                vm.reg.WaterLevel2.WaterLevelMeasurement.splice(index, 1);
            } else {
                vm.reg.WaterLevel2.WaterLevelMeasurement[0] = {};
            }
        }

        vm.save = function () {
            var _tmpArray = [];
            if (vm.reg.WaterLevel2) {
                if (vm.reg.WaterLevel2.WaterLevelMeasurement) {
                    vm.reg.WaterLevel2.WaterLevelMeasurement.forEach(function (item) {
                        if (item.DtMeasurementTime) {
                            _tmpArray.push(item);
                        }
                    });
                    vm.reg.WaterLevel2.WaterLevelMeasurement = _tmpArray;
                }
                Registration.save();
            }
        };

        vm.setToNow = function (waterlevel) {
            waterlevel.DtMeasurementTime = new Date(moment().seconds(0).milliseconds(0).toISOString());
        };

        vm._init = function () {
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);

            if (!vm.reg.WaterLevel2.WaterLevelMeasurement || vm.reg.WaterLevel2.WaterLevelMeasurement.length === 0) {
                vm.reg.WaterLevel2.WaterLevelMeasurement = [{}];
            } else {
                vm.reg.WaterLevel2.WaterLevelMeasurement.forEach(function (item) {
                    if (item.DtMeasurementTime && typeof (item.DtMeasurementTime) !== typeof(Date)) {
                        item.DtMeasurementTime = new Date(item.DtMeasurementTime);
                    }
                });
            }
            Utility.getKdvArray('Water_MarkingReferenceKDV').then(function (result) {
                vm.markingKdvArray = result;
            });
        };


        $scope.$on('$ionicView.beforeEnter', vm._init);
        $scope.$on('$ionicView.loaded', vm._init);
    });
