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


        vm.addWaterLevelPicture = function (waterLevel) {
            Pictures.showImageSelector(Utility.registrationTid($state.current.data.registrationProp)).then(function (result) {
                if (!waterLevel.Pictures) {
                    waterLevel.Pictures = [];
                }
                waterLevel.Pictures.push(pic);
            }, function (error) {
                AppLogging.log('Error getting picture: ' + (error && error.message ? error.message : ''));
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
            }
            if (vm.WaterLevelMeasurement.length === 0) {
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
