angular
    .module('RegObs')
    .directive('regobsDangerObs', function dangerObs($ionicModal, Registration, RegobsPopup, Utility) {
        return {
            link: link,
            templateUrl: 'app/directives/dangerobs/regobsDangerObs.html',
            scope: {
                areaArray: '=',
                dangerSignKdv: '@'
            },
            restrict: 'EA'
        };

        function link($scope){
            var indexEditing = -1;
            var showConfirm = function () {
                return RegobsPopup.delete('Slett observasjoner',
                    'Er du sikker på at du vil slette dette faretegnet?');
            };

            $scope.reg = Registration.initPropertyAsArray('DangerObs');

            $scope.noDangerSign = {};

            $scope.save = Registration.save;

            $scope.commentChanged = function () {
                if($scope.dangerObs.tempArea && $scope.dangerObs.tempComment){
                    $scope.dangerObs.Comment = 'Område: ' + $scope.dangerObs.tempArea + '. Beskrivelse: ' + $scope.dangerObs.tempComment;
                } else {
                    $scope.dangerObs.Comment = $scope.dangerObs.tempComment;
                }
            };

            $scope.dangerSignChanged = function () {
                $scope.noDangerSign.val = $scope.dangerObs.DangerSignTID === $scope.dangerSignKdvArray[1].Id;
            };

            $scope.addDangerObs = function () {
                $scope.commentChanged();
                $scope.reg.DangerObs.push($scope.dangerObs);
                $scope.modal.hide();
            };

            $scope.newDangerObs = function () {
                $scope.editing = false;
                $scope.dangerObs = {
                    DangerSignTID: $scope.dangerSignKdvArray[0].Id,
                    tempArea: $scope.areaArray[0]
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
                    console.log('toggle');
                    $scope.dangerObs.DangerSignTID = $scope.dangerSignKdvArray[1].Id;
                } else {
                    $scope.dangerObs.DangerSignTID = $scope.dangerSignKdvArray[0].Id;
                }
            };

            $scope.getDangerSignName = function (tid) {
                if(angular.isArray($scope.dangerSignKdvArray)){
                    for (var i = 0; i < $scope.dangerSignKdvArray.length; i++) {
                        var dangerSignKdv = $scope.dangerSignKdvArray[i];
                        if(dangerSignKdv.Id == tid){
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
                        console.log(response);
                        $scope.dangerSignKdvArray = response;
                        return response;
                    });
            };


            loadDangerSignKdvArray().then(loadModal);

            $scope.$on('$ionicView.beforeLeave', function () {
                $scope.modal.hide();
            });

            $scope.$on('$destroy', function() {
                $scope.modal.remove();
            });
        }
    });