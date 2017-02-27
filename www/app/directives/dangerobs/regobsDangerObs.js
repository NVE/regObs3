angular
    .module('RegObs')
    .directive('regobsDangerObs', function ($ionicModal, Registration, RegobsPopup, Utility, AppLogging, $translate) {
        'ngInject';
        return {
            link: link,
            templateUrl: 'app/directives/dangerobs/regobsDangerObs.html',
            scope: {
                areaArray: '=',
                dangerSignKdv: '@'
            },
            restrict: 'EA'
        };

        function link($scope) {
            var indexEditing = -1;
            var showConfirm = function () {
                return RegobsPopup.delete($translate.instant('DELETE_DANGER_OBS'),
                    $translate.instant('DELETE_DANGER_OBS_CONFIRM'));
            };

            $scope.reg = Registration.initPropertyAsArray('DangerObs');

            $scope.noDangerSign = {};

            $scope.save = Registration.save;
            var textArea;

            $scope.commentChanged = function () {
                if (!textArea) {
                    textArea = document.getElementById('dangerobs_text');
                }

                textArea.style.height = textArea.scrollHeight + "px";
                $scope.dangerObs.Comment = ($scope.dangerObs.tempArea ? 'Område: ' + $scope.dangerObs.tempArea + '. Beskrivelse: ' : '') + ($scope.dangerObs.tempComment || '');
            };

            $scope.dangerSignChanged = function () {
                $scope.noDangerSign.val = $scope.dangerObs.DangerSignTID === $scope.dangerSignKdvArray[0].Id;
            };

            $scope.addDangerObs = function () {
                $scope.commentChanged();
                if (!$scope.editing && !Utility.isEmpty($scope.dangerObs)) {
                    $scope.reg.DangerObs.push($scope.dangerObs);
                }
                $scope.modal.hide();
            };

            $scope.newDangerObs = function () {
                $scope.editing = false;
                $scope.dangerObs = {
                    DangerSignTID: null,
                    tempArea: ''
                };
                $scope.dangerSignChanged();
                $scope.modal.show();
            };

            $scope.editDangerObs = function (dangerObs, index) {
                indexEditing = index;
                $scope.dangerObs = dangerObs;
                $scope.dangerSignChanged();
                $scope.editing = true;
                $scope.modal.show();
            };

            $scope.deleteDangerObs = function () {
                showConfirm()
                    .then(function (response) {
                        if (response) {
                            $scope.reg.DangerObs.splice(indexEditing, 1);
                            $scope.modal.hide();
                            indexEditing = -1;
                        }
                    });
            };

            $scope.toggleNoDangerSign = function () {

                if ($scope.noDangerSign.val) {
                    $scope.dangerObs.DangerSignTID = $scope.dangerSignKdvArray[0].Id;
                } else {
                    $scope.dangerObs.DangerSignTID = null;
                }
            };

            $scope.getDangerSignName = function (tid) {
                if (angular.isArray($scope.dangerSignKdvArray)) {
                    for (var i = 0; i < $scope.dangerSignKdvArray.length; i++) {
                        var dangerSignKdv = $scope.dangerSignKdvArray[i];
                        if (dangerSignKdv.Id === tid) {
                            return dangerSignKdv.Name;
                        }
                    }
                }
            };

            var loadModal = function () {
                var url = 'app/directives/dangerobs/newdangerobs.html';
                return $ionicModal
                    .fromTemplateUrl(url, {
                        scope: $scope,
                        animation: 'slide-in-up'
                    }).then(function (modal) {
                        $scope.modal = modal;
                        return modal;
                    });
            };

            var loadDangerSignKdvArray = function () {
                return Utility
                    .getKdvArray($scope.dangerSignKdv)
                    .then(function (response) {
                        AppLogging.log(response);
                        $scope.dangerSignKdvArray = response;
                        return response;
                    });
            };


            loadDangerSignKdvArray().then(loadModal);

            $scope.$on('$ionicView.beforeLeave', function () {
                $scope.modal.hide();
            });

            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });
        }
    });
