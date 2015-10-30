angular
    .module('RegObs')
    .directive('dangerObs', function dangerObs($ionicModal, Registration, $ionicPopup, Utility) {
        return {
            link: link,
            templateUrl: 'app/directives/dangerObs.html',
            scope: {
                areaArray: '=',
                dangerSignKdv: '@'
            },
            restrict: 'EA'
        };

        function link($scope){
            var indexEditing = -1;
            var showConfirm = function () {
                return $ionicPopup.confirm({
                    title: 'Slett observasjoner',
                    template: 'Er du sikker på at du vil slette dette faretegnet?',
                    buttons: [
                        {text: 'Avbryt'},
                        {
                            text: 'Slett',
                            type: 'button-assertive',
                            onTap: function (e) {
                                // Returning a value will cause the promise to resolve with the given value.
                                return true;
                            }
                        }
                    ]
                });
            };

            $scope.dangerObsArray = Registration.getPropertyAsArray('DangerObs');

            $scope.noDangerSign = {};

            $scope.save = Registration.save;

            $scope.commentChanged = function () {
                $scope.dangerObs.Comment = 'Område: ' + $scope.dangerObs.tempArea + '. Beskrivelse: ' + ($scope.dangerObs.tempComment ? $scope.dangerObs.tempComment : '');
            };

            $scope.dangerSignChanged = function () {
                console.log('changed!', $scope.dangerObs.DangerSignTID, $scope.dangerSignKdvArray);
                $scope.noDangerSign.val = $scope.dangerObs.DangerSignTID === $scope.dangerSignKdvArray[1].Id;
                console.log($scope.noDangerSign);
            };

            $scope.addDangerObs = function () {
                $scope.commentChanged();
                $scope.dangerObsArray.push($scope.dangerObs);
                $scope.modal.hide();
            };

            $scope.newDangerObs = function () {
                $scope.editing = false;
                $scope.dangerObs = {
                    DangerSignTID: $scope.dangerSignKdvArray[0].Id,
                    tempArea: $scope.areaArray[0]
                };
                $scope.dangerSignChanged();
                $scope.dangerObs.DangerSignTID = $scope.dangerSignKdvArray[0].Id;
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
                            $scope.dangerObsArray.splice(indexEditing, 1);
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
                var url = 'app/directives/newdangerobs.html';
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