angular
    .module('RegObs')
    .controller('RegistrationStatusCtrl', function RegistrationStatusCtrl($scope, Registration, $state, Utility, $pbService, $http, AppSettings, $timeout, Observation) {
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
                vm._updateProgress();
                vm.isSending = false;
                //vm.updateStatus();
            });
        };

        vm.getObservationDescription = function (obs) {
            //var arr = [];
            //vm.completed.forEach(function (item) {
            //    var name = item.getName();
            //    if (arr.indexOf(name) < 0) { //Do not add duplicated values
            //        arr.push(name);
            //    }
            //});           
            //return arr.join(', ');
            return 'Faretegn, Bilder og notater';
        };

        vm._updateProgress = function () {
            $timeout(function () {
                $pbService.animate(vm.progressName, vm.downloadStatus.getPercent());
            });  
        };

        //vm.goToObservation = function (observation) {
        //    $state.go('observationdetails', { observation: observation });
        //};
        //vm.updateStatus = function () {
        //    if (vm.completed && angular.isArray(vm.completed)) {
        //        vm.completed.forEach(function (item) {
        //            if (!item.error) {
        //                item.isFetchingStatus = true;
        //                $http.get(AppSettings.getEndPoints().getLog + '/' + item.ObjectLogId).then(function (data) {
        //                    //if (data.Status === 1) {
        //                    //     //Observations.downloadObservation();
        //                    //}
        //                    item.status = data;
        //                }).catch(function (error) {
        //                    item.status = null;
        //                }).finally(function () {
        //                    item.isFetchingStatus = false;
        //                });
        //            } else {
        //                item.isFetchingStatus = false;
        //            }
        //        });
        //    }
        //};

        vm.resendFailed = function () {
            vm.unsent = Registration.unsent;
            vm.send();
        };

        

        $scope.$on('$ionicView.enter', vm.init);
    });