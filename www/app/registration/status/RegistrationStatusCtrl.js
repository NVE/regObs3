angular
    .module('RegObs')
    .controller('RegistrationStatusCtrl', function RegistrationStatusCtrl($scope, Registration, $ionicPopup, $state, $stateParams, Utility, $pbService, $http, AppSettings, $timeout, $q, Observations, Observation, $rootScope, $ionicScrollDelegate, $ionicHistory, AppLogging, RegobsPopup) {
        var vm = this;
        vm.loaded = false;
        vm.cancelled = false;

        vm.init = function () {
            vm.loaded = false;

            if ($stateParams.observation) {
                vm.completed = [$stateParams.observation];
                vm.loaded = true;
            } else {
                vm.isSending = true;
                vm.cancelled = false;
                
                vm.progressName = Utility.createGuid();
                vm.completed = [];
                Utility.clearRegistrationCacheViews().then(function () {
                    Registration.prepareRegistrationForSending().then(function () {
                        vm.unsent = Registration.unsent;
                        $ionicScrollDelegate.resize();
                        $ionicScrollDelegate.scrollTop();
                        vm.loaded = true;
                        if (vm.unsent.length > 0) {
                            vm.send();
                        } else {
                            vm.goToStart();
                        }
                    });
                });
            }
        };

        vm.isStoredObservation = function () {
            return true && $stateParams.observation;
        };

        vm.emailReceipt = AppSettings.data.emailReceipt;

        vm.failed = function () {
            if (vm.completed) {
                return vm.completed.filter(function (item) {
                    return item.error;
                }).length > 0;
            }
            return false;
        };

        vm.send = function () {
            vm.isSending = true;
            vm.cancelled = false; 
            Utility.setBackView('start');
            vm.completed = [];
            vm.downloadStatus = new RegObs.ProggressStatus();
            vm.downloadStatus.setTotal(vm.unsent.length);
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
                        '<i class="icon ion-ios-cloud-upload"></i><div class="downloadprogress-percent">' +
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

            vm.cancelPromise = $q.defer();

            Registration.post(onItemCompleteCallback, vm.cancelPromise).then(function () {
                vm._updateProgress().then(function () {
                    $timeout(function () {
                        vm.isSending = false;
                    });
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
            if (!obs.error && obs.RegId) {
                vm.loadingRegistration = true;
                Observations.getRegistrationsById(obs.RegId).then(function (result) {
                    return Registration.clearExistingNewRegistrations().then(function () {
                        $state.go('observationdetails', { observation: Observation.fromJson(result) });
                    });
                }).finally(function () {
                    vm.loadingRegistration = false;
                });
            }
        };

        vm.goToStart = function () {
            Utility.setBackView('start');
            $ionicHistory.goBack();
        };

        vm.resendFailed = function () {
            vm.unsent = Registration.unsent;
            vm.send();
        };

        vm.deleteUnsent = function (item) {
            RegobsPopup.delete('DELETE_OBSERVATION', 'DELETE_UNSENT_OBSERVATION_CONFIRM_TEXT')
                .then(function (response) {
                    if (response) {
                        Registration.unsent = Registration.unsent.filter(function (reg) {
                            return reg.id !== item.id;
                        });
                        Registration.save();
                        vm.goToStart();
                    }
                });
        };

        vm.cancel = function () {
            if (vm.cancelPromise) {
                vm.cancelled = true;
                vm.cancelPromise.resolve();
            }
        };

        $scope.$on('$ionicView.enter', vm.init);

        $scope.$on('$ionicView.beforeLeave', function () {
            vm.loaded = false;
            if (vm.cancelPromise && vm.isSending) {
                vm.cancelPromise.resolve();
            }
        });
    });