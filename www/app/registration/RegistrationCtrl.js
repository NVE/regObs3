﻿angular
    .module('RegObs')
    .controller('RegistrationCtrl', function SnowRegistrationCtrl($scope, Registration, Utility, Property, $ionicHistory, ObsLocation, AppLogging) {
        var vm = this;
        vm.hasFooter = function () {
            return Registration.showSend();
        };

        vm.getTitle = function () {
            if (vm.reg && vm.reg.GeoHazardTID) {
                return Utility.getGeoHazardType(vm.reg.GeoHazardTID).toUpperCase() + '_OBSERVATION';
            }
            return '';
        };

        vm.propertyExists = function (prop) {
            return Property.exists(prop);
        };

        vm.save = function () {
            Registration.save();        
        };

        vm.loaded = false;

        vm._resetHistory = function () {
            var historyId = $ionicHistory.currentHistoryId();
            var history = $ionicHistory.viewHistory().histories[historyId];
            for (var i = history.stack.length - 1; i >= 0; i--) {
                if (history.stack[i].stateName === 'start') {
                    $ionicHistory.backView(history.stack[i]);
                }
            }
        };

        vm.hasLocation = function () {
            return ObsLocation.isSet();
        };

        vm.locationText = function () {
            return ObsLocation.getDescription();
        };


        $scope.$on('$ionicView.enter', function () {
            vm._resetHistory();
            vm.reg = Registration.data;
            vm.loaded = true;
        });

        $scope.$on('$ionicView.beforeLeave', function () {
            vm.loaded = false;
        });

        $scope.$on('$regObs:registrationSaved', function () {
            vm.reg = Registration.data;
        });
    });

