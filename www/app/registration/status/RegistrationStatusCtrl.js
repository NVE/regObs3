angular
    .module('RegObs')
    .controller('RegistrationStatusCtrl', function RegistrationStatusCtrl($scope, Registration, $ionicPopup, $state, Utility, $pbService, $http, AppSettings, $timeout, $q, Observations, Observation) {
        var vm = this;
        vm.loaded = false;

        vm.init = function () {
            Utility.setBackView('start');
            vm.progressName = Utility.createGuid();
            vm.completed = [];
            vm.loaded = false;
            Registration.prepareRegistrationForSending().then(function () {
                vm.unsent = Registration.unsent;
                vm.loaded = true;

                if (vm.unsent.length > 0) {
                    vm.send();
                } else {
                    $state.go('start');
                }
            });
        };

        vm.failed = function () {
            if (vm.completed) {
                return vm.completed.filter(function (item) {
                    return item.error;
                }).length > 0;
            }
            return false;
        };

        vm.send = function () {
            vm.completed = [];
            vm.downloadStatus = new RegObs.ProggressStatus();
            vm.downloadStatus.setTotal(vm.unsent.length);
            vm.isSending = true;
            vm.progressOptions = {
                color: '#333',
                // This has to be the same size as the maximum width to
                // prevent clipping
                strokeWidth: 4,
                trailWidth: 1,
                easing: 'easeInOut',
                duration: 10,
                from: { color: '#aaa', width: 1 },
                to: { color: '#333', width: 4 },
                // Set default step function for all animate calls
                step: function (state, circle) {
                    circle.path.setAttribute('stroke', state.color);
                    circle.path.setAttribute('stroke-width', state.width);
                    var text =
                        '<i class="icon ion-ios-cloud-download"></i><div class="downloadprogress-percent">' +
                        vm.downloadStatus.getPercentFormated() +
                        '</div><div class="downloadprogress-value">(' +
                        vm.downloadStatus.getDone() +
                        '/' +
                        vm.downloadStatus.getTotal() +
                        ')' +
                        '</div>';
                    circle.setText(text);
                }
            };

            var onItemCompleteCallback = function (registration) {
                vm.completed.push(registration);
                vm.downloadStatus.addComplete();
                vm._updateProgress();
            };

            Registration.post(onItemCompleteCallback).then(function () {
                vm._updateProgress().then(function () {
                    vm.isSending = false;
                });
            });
        };

        vm._updateProgress = function () {
            return $q(function (resolve) {
                $timeout(function () {
                    $pbService.animate(vm.progressName, vm.downloadStatus.getPercent());
                    $timeout(function () {
                        resolve();
                    }, 1000);
                });
            });
        };


        vm.onRegistrationClick = function (obs) {
            if (!obs.error) {
                vm.loadingRegistration = true;
                //Observations.getRegistrationsById(obs.RegId).then(function () {
                //    return Registration.clearExistingNewRegistrations();
                //}).then(function () {
                //    return Observations.getStoredObservations(Utility.getCurrentGeoHazardTid(), false).then(function (result) {
                //        var filtered = result.filter(function (item) { return item.RegId === obs.RegId; });
                //        if (filtered.length > 0) {
                //            $state.go('observationdetails', { observation: Observation.fromJson(filtered[0]) });
                //        }
                //        return true;
                //    });
                //}).finally(function () {
                //    vm.loadingRegistration = false;
                //});
                Observations.getRegistrationsById(obs.RegId).then(function (result) {
                    return Registration.clearExistingNewRegistrations().then(function () {
                        $state.go('observationdetails', { observation: Observation.fromJson(result) });
                    });
                }).finally(function () {
                    vm.loadingRegistration = false;
                });
            }
        };

        vm.resendFailed = function () {
            vm.unsent = Registration.unsent;
            vm.send();
        };



        $scope.$on('$ionicView.enter', vm.init);
    });