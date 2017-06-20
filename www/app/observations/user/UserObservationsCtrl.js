angular
    .module('RegObs')
    .controller('UserObservationsCtrl', function ($scope, Observations, Registration, Observation, Utility, RegobsPopup, $timeout, $http, AppSettings) {
        var vm = this;

        vm.observations = [];
        vm.isLoading = false;

        vm._findById = function (id) {
            var found = vm.observations.filter(function (item) {
                return item.Id === id;
            });
            if (found.length > 0) {
                return found[0];
            } else {
                return null;
            }
        };

        vm._createRegistrationFromUnsentItem = function (item) {
            var itemPrep = angular.copy(item);

            itemPrep.Registrations = [];
            for (var prop in item) {
                if (Utility.isObservation(prop)) {
                    var def = Utility.getObservationDefinition(Utility.registrationTid(prop));
                    itemPrep.Registrations.push({ RegistrationName: def.name });
                }
            }

            itemPrep.GeoHazardTid = itemPrep.GeoHazardTID;
            delete itemPrep.GeoHazardTID;
            itemPrep.isLocal = true;

            if (itemPrep.ObsLocation) {
                if (itemPrep.ObsLocation.ObsLocationId) {
                    itemPrep.LocationName = itemPrep.ObsLocation.Name;
                } else if (itemPrep.ObsLocation.place) {
                    itemPrep.MunicipalName = itemPrep.ObsLocation.place.Navn;
                    itemPrep.ForecastRegionName = itemPrep.ObsLocation.place.Fylke;
                }
            }


            var obs = Observation.fromJson(itemPrep);

            if (angular.isArray(itemPrep.Picture)) {
                itemPrep.Picture.forEach(function (pic) {
                    var def = Utility.getObservationDefinition(pic.RegistrationTID);
                    obs._images.push({ url: pic.PictureImageBase64, name: def.name });
                });
            }

            return obs;
        };

        vm._addUnsentObservations = function () {
            if (angular.isArray(Registration.unsent)) {
                Registration.unsent.forEach(function (item) {
                    if (!vm._findById(item.Id)) {

                        var obs = vm._createRegistrationFromUnsentItem(item);
                        vm.observations.push(obs);
                    }
                });
            }
        };

        vm._updateObservationsFromServer = function () {
            var workFunc = function (onProgress, cancel) {
                return Observations.updateUserObservations(onProgress, cancel);
            };
            return RegobsPopup.downloadProgress('UPDATE_MY_OBSERVATIONS', workFunc, { longTimoutMessageDelay: 20, closeOnComplete: true });
        };


        vm.getGeoHazardName = function (item) {
            return Utility.getGeoHazardType(item.GeoHazardTid);
        };

        vm.update = function () {
            vm.isLoading = true;
            vm.observations = [];
            vm._addUnsentObservations();
            vm._updateObservationsFromServer().then(Observations.getStoredUserObservations).then(function (userObservations) {
                $timeout(function () {
                    vm.observations = vm.observations.concat(userObservations.map(function (item) { return Observation.fromJson(item); }));
                });
            }).finally(function () {
                $timeout(function () {
                    $scope.$broadcast('scroll.refreshComplete');
                    vm.isLoading = false;
                });
            });
        };

        $scope.$on('$ionicView.loaded',
            function () {
                vm.update();
            });

    });