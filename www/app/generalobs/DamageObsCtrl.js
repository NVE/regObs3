angular
    .module('RegObs')
    .controller('DamageObsCtrl', function ($scope, $state, Registration, Property, $ionicScrollDelegate, Utility, Pictures, $filter, AppLogging, RegobsPopup, $translate, AppSettings) {
        var vm = this;
        var noDamageVisibleId = 7;
        var unknownDamageVisibleId = 0;

        vm.geoHazardId = Registration.data.GeoHazardTID;

        vm.anyChecked = function () {
            return vm.DamageObsArray.filter(function (damageObs) {
                return damageObs.DamageTypeTID !== noDamageVisibleId && damageObs.checked === true;
            }).length > 0;
        };

        vm.anyCheckedNotUnknown = function () {
            return vm.DamageObsArray.filter(function (damageObs) {
                return damageObs.DamageTypeTID !== noDamageVisibleId && damageObs.DamageTypeTID !== unknownDamageVisibleId && damageObs.checked === true;
            }).length > 0;
        };

        vm.update = function () {
            vm.DamageObsTypeKdvArray.forEach(function (item) {
                var exists = vm.DamageObsArray.filter(function (damageObs) {
                    return item.Id === damageObs.DamageTypeTID;
                });
                if (exists.length == 0) {
                    vm.DamageObsArray.push({ DamageTypeTID: item.Id, Name: item.Name, Description: item.Description, checked: false });
                } else {
                    var damageObs = exists[0];
                    damageObs.Name = item.Name;
                    damageObs.Description = item.Description;
                    damageObs.checked = true;
                }
            });

            var noDamageChecked = vm.DamageObsArray.filter(function (damageObs) {
                return damageObs.DamageTypeTID === noDamageVisibleId && damageObs.checked === true;
            }).length > 0;

            if (noDamageChecked) {
                vm.DamageVisible = 0;
            } else if (vm.anyChecked()) {
                vm.DamageVisible = 1;
            } else {
                vm.DamageVisible = null;
            }
        };

        vm.init = function () {
            vm.isAddingPosition = false;
            vm.registrationProp = $state.current.data.registrationProp;
            vm.reg = Registration.initPropertyAsArray($state.current.data.registrationProp);
            vm.DamageObsArray = angular.copy(vm.reg.DamageObs);
            var geoHazardName = AppSettings.getAppMode();
            var kdvName = geoHazardName.charAt(0).toUpperCase() + geoHazardName.slice(1) + '_DamageTypeKDV';
            Utility.getKdvArray(kdvName, true).then(function (result) {
                vm.DamageObsTypeKdvArray = result;
                vm.update();
            });
        };

        vm.setChecked = function (id, checked) {
            var item = vm.DamageObsArray.filter(function (item) {
                return item.DamageTypeTID === id;
            });
            if (item.length > 0) {
                item[0].checked = checked;
            }
        };

        vm.DamageVisibleChanged = function () {
            if (vm.DamageVisible === 0) {
                vm.DamageObsArray.forEach(function (item) {
                    if (item.DamageTypeTID === noDamageVisibleId) {
                        item.checked = true;
                    } else {
                        item.checked = false;
                    }
                });
            } else if (vm.DamageVisible === 1) {
                vm.setChecked(noDamageVisibleId, false);
                if (vm.anyCheckedNotUnknown()) {
                    vm.setChecked(unknownDamageVisibleId, false);
                } else {
                    vm.setChecked(unknownDamageVisibleId, true);
                }
            }
        };

        vm.openHelpTextPopover = function (text) {
            $translate('HELP').then(function (translation) {
                RegobsPopup.alert(translation, text);
            });
        };

        vm.addDamageObsPicture = function (damageObs) {
            AppLogging.log('Open picture selector');
            Pictures.showImageSelector(Utility.registrationTid(vm.registrationProp)).then(function (result) {
                if (!damageObs.Pictures) {
                    damageObs.Pictures = [];
                }
                damageObs.Pictures.push(result);
                $ionicScrollDelegate.resize();
            }, function (error) {
                AppLogging.log('Error getting picture: ' + (error && error.message ? error.message : ''));
            });
        };

        vm.removeImage = function (damageObs, index) {
            if (damageObs.Pictures && damageObs.Pictures.length > index) {
                $translate(['REMOVE_PICTURE', 'REMOVE_PICTURE_TEXT', 'REMOVE']).then(function (translations) {
                    RegobsPopup.delete(translations['REMOVE_PICTURE'], translations['REMOVE_PICTURE_TEXT'], translations['REMOVE'])
                        .then(function (confirmed) {
                            if (confirmed) {
                                damageObs.Pictures.splice(index, 1);
                            }
                        });
                });              
            }
        };


        vm.save = function () {
            if (!vm.isAddingPosition) {
                if (vm.DamageObsArray && angular.isArray(vm.DamageObsArray)) {
                    vm.DamageVisibleChanged();
                    vm.reg.DamageObs = [];

                    for (var i = 0; i < vm.DamageObsArray.length; i++) {
                        var damageObs = vm.DamageObsArray[i];
                        if (damageObs.checked) {
                            var clone = angular.copy(damageObs);
                            delete clone.checked;
                            vm.reg.DamageObs.push(clone);
                        }
                    }
                }

                Registration.save();
            }
        };

        vm.reset = function () {
            Property.reset(vm.registrationProp);
        };

        vm.addDamagePosition = function (dm) {
            vm.save();
            vm.isAddingPosition = true;
            var damageObsFiltered = vm.reg.DamageObs.filter(function (item) {
                return item.DamageTypeTID === dm.DamageTypeTID;
            });
            if (damageObsFiltered.length > 0){
                $state.go('confirmdamagelocation', { damageObs: damageObsFiltered[0] }, { reload: true });
            }  
        };

        vm.formatPosition = function (position) {
            return Utility.formatLatLng(position.Latitude, position.Longitude);
        };

        $scope.$on('$regobs:propertyReset', function () {
            vm.update();
            $ionicScrollDelegate.resize();
            $ionicScrollDelegate.scrollTop();
        });

        $scope.$on('$ionicView.beforeEnter', vm.init);
    });