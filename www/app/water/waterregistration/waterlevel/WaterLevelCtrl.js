angular
    .module('RegObs')
    .controller('WaterLevelCtrl', function ($scope, $state, Registration, $ionicPopup, Property, AppLogging, moment) {

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

        vm.addWaterLevelPicture = function () {
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
            });
        };

        vm.reset = function () {
            vm.reg.WaterLevel2.WaterLevelMeasurement = [{}];
            Property.reset($state.current.data.registrationProp);          
        };

        vm.save = function () {
            var _tmpArray = [];
            if (vm.reg.WaterLevel2) {
                if (vm.reg.WaterLevel2.WaterLevelMeasurement) {
                    vm.reg.WaterLevel2.WaterLevelMeasurement.forEach(function (item) {
                        if (item._dtMeasurementTime) {
                            item.DtMeasurementTime = moment(item._dtMeasurementTime).toISOString();
                            _tmpArray.push(item);
                        }
                    });
                    vm.reg.WaterLevel2.WaterLevelMeasurement = _tmpArray;
                }
                Registration.save();
            }
        };

        vm.setToNow = function (index) {
            vm.reg.WaterLevel2.WaterLevelMeasurement[index]._dtMeasurementTime = new Date(moment().seconds(0).milliseconds(0).toISOString());
        };

        vm._init = function () {
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);

            if (!vm.reg.WaterLevel2.WaterLevelMeasurement || vm.reg.WaterLevel2.WaterLevelMeasurement.length === 0) {
                vm.reg.WaterLevel2.WaterLevelMeasurement = [{}];
            } else {
                vm.reg.WaterLevel2.WaterLevelMeasurement.forEach(function (item) {
                    item._dtMeasurementTime = new Date(item.DtMeasurementTime);
                });
            }
        };


        $scope.$on('$ionicView.beforeEnter', vm._init);
        $scope.$on('$ionicView.loaded', vm._init);
    });
