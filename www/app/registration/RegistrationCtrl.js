angular
    .module('RegObs')
    .controller('RegistrationCtrl', function SnowRegistrationCtrl($scope, User, Registration, Utility, Property, $ionicHistory, ObsLocation, AppLogging, ObservationType) {
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

        vm.hasLocation = function () {
            return ObsLocation.isSet();
        };

        vm.locationText = function () {
            return ObsLocation.getDescription();
        };

        vm.getObserverGroupName = function () {
            if (!vm.reg.ObserverGroupID)
                return '';

            var group = vm.observerGroups.filter(function (item) {
                return item.Id == vm.reg.ObserverGroupID;
            });
            if (group.length > 0) {
                var name = group[0].Name;
                return name;
            } else {
                return '';
            }
        };


        $scope.$on('$ionicView.enter', function () {
            Utility.setBackView('start');
            vm.reg = Registration.data;

            vm.observerGroups = User.getObserverGroups();
            vm.hasObserverGroups = vm.observerGroups.length > 0;

            vm.loaded = true;
        });

        $scope.$on('$ionicView.beforeLeave', function () {
            vm.loaded = false;
        });

        $scope.$on('$regObs:registrationSaved', function () {
            vm.reg = Registration.data;
        });
    });

