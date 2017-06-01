angular
    .module('RegObs')
    .controller('WaterLevelCtrl', function ($scope, $state, Registration, $ionicPopup, Property, AppLogging, moment, Pictures, Utility, $cordovaCamera, AppSettings, $translate, $ionicScrollDelegate, RegobsPopup) {
        var vm = this;

        vm.addWaterLevelMeasurement = function () {
            vm.WaterLevelMeasurement.push({});
        };

        vm.removeImage = function (waterlevel, index) {
            if (waterlevel.Pictures && waterlevel.Pictures.length > index) {
                $translate(['REMOVE_PICTURE', 'REMOVE_PICTURE_TEXT', 'REMOVE']).then(function (translations) {
                    RegobsPopup.delete(translations['REMOVE_PICTURE'], translations['REMOVE_PICTURE_TEXT'], translations['REMOVE'])
                        .then(function (confirmed) {
                            if (confirmed) {
                                waterlevel.Pictures.splice(index, 1);
                            }
                        });
                });
            }
        };
        vm._addWaterLevelCameraPicture = function (waterLevel, useCamera) {
            var processPictureResult = function (imageUri) {
                var pic = {
                    RegistrationTID: Utility.registrationTid($state.current.data.registrationProp),
                    PictureImageBase64: imageUri,
                    PictureComment: ''
                };

                if (AppSettings.data.compass) {
                    Pictures.setOrientation(pic);
                }

                waterLevel.Pictures.push(pic);
            };


            if (window.Camera) {
                var options = useCamera ? Pictures.defaultCameraOptions() : Pictures.defaultAlbumOptions();
                return $cordovaCamera
                    .getPicture(options)
                    .then(processPictureResult, function (err) {
                        // error
                        AppLogging.log('Picture selection cancelled');
                    });
            } else {
                AppLogging.error('Camera plugin not found!');
            }
        };


        vm.addWaterLevelPicture = function (waterLevel) {
            if (!waterLevel.Pictures) {
                waterLevel.Pictures = [];
            }
            $translate(['ADD_PICTURE', 'ADD_PICTURE_DESCRIPTION', 'ALBUM', 'CAMERA']).then(function (translations) {
                $ionicPopup.confirm({
                    title: translations['ADD_PICTURE'],
                    template: translations['ADD_PICTURE_DESCRIPTION'],
                    buttons: [
                        {
                            text: translations['ALBUM'],
                            type: 'button icon-left ion-images',
                            onTap: function (e) {
                                // Returning a value will cause the promise to resolve with the given value.
                                return false;
                            }
                        },
                        {
                            text: translations['CAMERA'],
                            type: 'button icon-left ion-camera',
                            onTap: function (e) {
                                // Returning a value will cause the promise to resolve with the given value.
                                return true;
                            }
                        }
                    ]
                }).then(function (result) {
                    vm._addWaterLevelCameraPicture(waterLevel, result);
                });
            });
        };

        vm.waterLevelMethodChanged = function () {
            vm.reg.WaterLevel2.MarkingReferenceTID = null;
            vm.reg.WaterLevel2.Comment = null;
            vm.reg.WaterLevel2.MarkingTypeTID = null;
            vm.reg.WaterLevel2.MeasurementReferenceTID = null;
            vm.reg.WaterLevel2.MeasuringToolDescription = null;
            vm.reg.WaterLevel2.WaterLevelMeasurement = [{}];
        };

        vm.waterMeasurementTypeChanged = function () {
            vm.reg.WaterLevel2.MeasurementReferenceTID = null;
            vm.reg.WaterLevel2.MeasuringToolDescription = null;
            vm.reg.WaterLevel2.Comment = null;
        };

        vm.reset = function () {          
            Property.reset($state.current.data.registrationProp);
        };

        vm.removeMeasurement = function (index) {
            if (vm.WaterLevelMeasurement.length > 1) {
                vm.WaterLevelMeasurement.splice(index, 1);
            } else {
                vm.WaterLevelMeasurement[0] = {};
            }
        }

        vm.save = function () {
            var _tmpArray = [];
            if (vm.reg.WaterLevel2) {
                if (vm.WaterLevelMeasurement) {
                    vm.WaterLevelMeasurement.forEach(function (item) {
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

        vm.showRemoveWaterMeasurment = function (index) {
            if (index > 0) {
                return true;
            }
            var wm = vm.WaterLevelMeasurement[index];
            return !Utility.isEmpty(JSON.parse(angular.toJson(wm)));
        };

        vm._init = function () {

            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);

            vm.WaterLevelMeasurement = [];

            if (vm.reg.WaterLevel2.WaterLevelMeasurement && angular.isArray(vm.reg.WaterLevel2.WaterLevelMeasurement)) {
                vm.reg.WaterLevel2.WaterLevelMeasurement.forEach(function (item) {
                    var clone = angular.copy(item);
                    
                    if (clone.DtMeasurementTime && typeof (clone.DtMeasurementTime) !== typeof (Date)) {
                        clone.DtMeasurementTime = new Date(clone.DtMeasurementTime);
                    }
                    vm.WaterLevelMeasurement.push(clone);
                });
            } else {
                vm.WaterLevelMeasurement.push({});
            }
            Utility.getKdvArray('Water_MarkingReferenceKDV').then(function (result) {
                vm.markingKdvArray = result;
            });
            Utility.getKdvArray('Water_MeasurementReferenceKDV').then(function (result) {
                vm.measurementReferenceKdvArray = result;
            });
        };


        $scope.$on('$ionicView.beforeEnter', vm._init);

        $scope.$on('$regobs:propertyReset', function () {
            vm.WaterLevelMeasurement = [{}];
            $ionicScrollDelegate.resize();
            $ionicScrollDelegate.scrollTop();
        });
    });
