angular
    .module('RegObs')
    .controller('DamageObsCtrl', function ($scope, $state, Registration, Property, $ionicScrollDelegate, Utility) {
        var vm = this;
        var noDamageVisibleId = 7;
        var unknownDamageVisibleId = 0;

        vm.anyChecked = function () {
            return vm.reg.DamageObs.filter(function (damageObs) {
                return damageObs.DamageTypeTID !== noDamageVisibleId && damageObs.checked === true;
            }).length > 0;
        };

        vm.anyCheckedNotUnknown = function () {
            return vm.reg.DamageObs.filter(function (damageObs) {
                return damageObs.DamageTypeTID !== noDamageVisibleId && damageObs.DamageTypeTID !== unknownDamageVisibleId && damageObs.checked === true;
            }).length > 0;
        };

        vm.update = function () {
            vm.DamageObsTypeKdvArray.forEach(function (item) {
                var exists = vm.reg.DamageObs.filter(function (damageObs) {
                    return item.Id === damageObs.DamageTypeTID;
                });
                if (exists.length == 0) {
                    vm.reg.DamageObs.push({ DamageTypeTID: item.Id, Name: item.Name, checked: false });
                } else {
                    var damageObs = exists[0];
                    damageObs.checked = true;
                    damageObs.Name = item.Name;
                }
            });

            var noDamageChecked = vm.reg.DamageObs.filter(function (damageObs) {
                return damageObs.DamageTypeTID === noDamageVisibleId && damageObs.checked === true;
            }).length > 0;

            if (noDamageChecked) {
                vm.DamageVisible = 0;
            } else if (vm.anyChecked()){
                vm.DamageVisible = 1;
            } else {
                vm.DamageVisible = null;
            }
        };

        vm.init = function () {
            vm.registrationProp = $state.current.data.registrationProp;
            vm.reg = Registration.initPropertyAsArray($state.current.data.registrationProp);
            Utility.getKdvArray('DamageTypeKDV').then(function (result) {
                vm.DamageObsTypeKdvArray = result;
                vm.update();
            });
        };

        vm.setChecked = function (id, checked) {
            var item = vm.reg.DamageObs.filter(function (item) {
                return item.DamageTypeTID === id;
            });
            if (item.length > 0) {
                item[0].checked = checked;
            }
        };

        vm.DamageVisibleChanged = function(){
            if (vm.DamageVisible === 0) {
                vm.reg.DamageObs.forEach(function (item) {
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

        vm.save = function () {
            if (vm.reg.DamageObs && angular.isArray(vm.reg.DamageObs)) {
                vm.DamageVisibleChanged();

                for (var i = 0; i < vm.reg.DamageObs.length; i++) {
                    var damageObs = vm.reg.DamageObs[i];
                    if (!damageObs.checked) {
                        vm.reg.DamageObs.splice(i, 1);
                        i--;
                    }
                }
            }

            Registration.save();
        };

        vm.reset = function () {
            Property.reset(vm.registrationProp);
        };

        $scope.$on('$regobs:propertyReset', function () {
            vm.update();
            $ionicScrollDelegate.resize();
            $ionicScrollDelegate.scrollTop();
        });

        $scope.$on('$ionicView.beforeEnter', vm.init);
    });